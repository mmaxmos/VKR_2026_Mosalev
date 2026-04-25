import logging
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routers import router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="GameFuse Mock API",
    version="1.0.0"
)

# Request logging middleware with timing info
@app.middleware("http")
async def log_request_middleware(request: Request, call_next):
    """Log all requests with timing."""
    start_time = time.time()

    # Call the endpoint
    response = await call_next(request)
    
    # Calculate processing time
    process_time = time.time() - start_time
    
    # Log the request
    logger.info(
        f"{request.method} {request.url.path} | "
        f"Status: {response.status_code} | "
        f"Duration: {process_time:.3f}s"
    )
    
    # Add response header with processing time
    response.headers["X-Process-Time"] = str(process_time)
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
