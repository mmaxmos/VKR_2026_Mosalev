import json
import os
import logging
import asyncio
from dotenv import load_dotenv
import asyncpg
from typing import Optional, List, Dict, Any

load_dotenv()

logger = logging.getLogger(__name__)


class DatabaseConnection:
    _instance: Optional['DatabaseConnection'] = None
    _pool: Optional[asyncpg.Pool] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.host = os.getenv('DB_HOST', 'localhost')
            self.port = int(os.getenv('DB_PORT', '5432'))
            self.database = os.getenv('DB_NAME')
            self.user = os.getenv('DB_USER')
            self.password = os.getenv('DB_PASSWORD')
            self.max_retries = 3
            self.retry_delay = 1  # seconds
            self.initialized = True
    
    async def get_pool(self) -> asyncpg.Pool:
        """Get or create database connection pool with retry logic"""
        if self._pool is not None:
            return self._pool
        
        last_exception = None

        async def init_connection(conn):
            await conn.set_type_codec(
                'jsonb',
                schema='pg_catalog',
                encoder=json.dumps,
                decoder=json.loads,
                format='text'
            )
        
        for attempt in range(self.max_retries):
            try:
                self._pool = await asyncpg.create_pool(
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.user,
                password=self.password,
                min_size=5,
                max_size=20,
                command_timeout=60,
                init=init_connection
                )
                if attempt > 0:
                    logger.info(f"Database connection pool created after {attempt} retries")
                return self._pool
            except asyncpg.PostgresError as e:
                last_exception = e
                if attempt < self.max_retries - 1:
                    wait_time = self.retry_delay * (2 ** attempt)  # exponential backoff
                    logger.warning(f"Database connection failed (attempt {attempt + 1}/{self.max_retries}). Retrying in {wait_time}s... Error: {str(e)}")
                    await asyncio.sleep(wait_time)
                else:
                    logger.error(f"Database connection failed after {self.max_retries} attempts: {str(e)}")
        
        raise last_exception or asyncpg.PostgresError("Failed to connect to database after multiple retries")
    
    async def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute a query and return results as list of dicts"""
        pool = await self.get_pool()
        
        try:
            async with pool.acquire() as conn:
                results = await conn.fetch(query, *(params or ()))
                return [dict(row) for row in results]
        except asyncpg.PostgresError as e:
            logger.error(f"Database operational error during query execution: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during database query: {str(e)}")
            raise
    
    async def close_pool(self):
        """Close database connection pool"""
        if self._pool:
            await self._pool.close()
            self._pool = None
            logger.info("Database connection pool closed")


db = DatabaseConnection()
