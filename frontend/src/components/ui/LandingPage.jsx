import React from 'react';
import { 
    Zap, MessageSquareText, ChevronUp
} from 'lucide-react';
import ChartIcon from '@/assets/lending/card1.svg';
import Card2Icon from '@/assets/lending/card2.svg';
import Card3Icon from '@/assets/lending/card3.svg';
import HowWork1Icon from '@/assets/lending/how_it_work1.svg';
import HowWork2Icon from '@/assets/lending/how_it_work2.svg';
import HowWork3Icon from '@/assets/lending/how_it_work3.svg';
import DescrIcon from '@/assets/lending/descr.svg';
import BackgroundImg from '@/assets/lending/backg.png';
import DatabaseIcon from '@/assets/lending/database.svg';
import StarShineIcon from '@/assets/lending/star_shine.svg';
import FinanceIcon from '@/assets/lending/finance.svg';
import CodeBlocksIcon from '@/assets/lending/code_blocks.svg';

export const LandingPage = ({ t, onGetStarted }) => {
    return (
        <div className="landing-root relative w-full min-h-screen overflow-y-auto custom-scrollbar bg-[#F4F6FB]">
            <style>{`
                @media (max-width: 1023px) {
                    .landing-hero-content {
                        width: 100% !important;
                        max-width: 720px;
                    }
                    .landing-hero-title-wrap {
                        width: 100% !important;
                        gap: 16px !important;
                    }
                    .landing-hero-row {
                        width: 100% !important;
                        height: auto !important;
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                    .landing-hero-row h1 {
                        font-size: 56px !important;
                    }
                    .landing-hero-subtitle {
                        width: 100% !important;
                        max-width: 560px;
                        margin-top: 8px !important;
                    }
                    .landing-hero-ctas {
                        width: 100% !important;
                        height: auto !important;
                        justify-content: center;
                        flex-wrap: wrap;
                    }
                }

                @media (max-width: 767px) {
                    .landing-hero {
                        min-height: auto !important;
                        padding: 88px 16px 56px !important;
                    }
                    .landing-hero-content {
                        gap: 20px !important;
                    }
                    .landing-hero-row h1 {
                        font-size: 36px !important;
                        line-height: 110% !important;
                        letter-spacing: -0.03em !important;
                    }
                    .landing-hero-subtitle {
                        font-size: 14px !important;
                        line-height: 145% !important;
                    }
                    .landing-hero-ctas {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        gap: 10px !important;
                    }
                    .landing-hero-ctas > button,
                    .landing-hero-ctas > a {
                        width: 100% !important;
                    }

                    .landing-advantages,
                    .landing-final-cta {
                        padding-left: 16px !important;
                        padding-right: 16px !important;
                        padding-top: 72px !important;
                        padding-bottom: 72px !important;
                    }

                    .landing-section-title {
                        font-size: 30px !important;
                        line-height: 115% !important;
                    }
                }
            `}</style>
            {/* Hero Section */}
            <section 
                className="landing-hero relative w-full flex flex-col justify-center items-center bg-[#F4F6FB]"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '0px 16px',
                    gap: '48px',
                    minHeight: '100vh',
                    borderRadius: '24px',
                    position: 'relative'
                }}
            >
                {/* Background Image */}
                <img 
                    src={BackgroundImg} 
                    alt="background"
                    className="absolute left-0 pointer-events-none"
                    style={{ 
                        zIndex: 0, 
                        top: '100px',
                        height: 'auto',
                        width: '100%',
                        maxWidth: '100vw',
                        objectFit: 'contain',
                        objectPosition: 'center'
                    }}
                />

                {/* Hero Content Container */}
                <div 
                    className="landing-hero-content"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '0px',
                        gap: '28px',
                        width: '1348px',
                        height: 'auto',
                        position: 'relative',
                        zIndex: 10
                    }}
                >
                    {/* AI Badge */}
                    <div 
                        className="landing-hero-title-wrap"
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '4px 16px 4px 12px',
                            gap: '4px',
                            width: '117px',
                            height: '32px',
                            background: 'radial-gradient(100% 7302.48% at 0% 1.14%, rgba(255, 117, 73, 0.12) 0%, rgba(255, 86, 32, 0.12) 100%)',
                            borderRadius: '1000px'
                        }}
                    >
                        <Zap className="w-[18px] h-[18px]" style={{ color: '#FF6A36', flexShrink: 0 }} />
                        <span 
                            style={{
                                fontFamily: 'Onest',
                                fontStyle: 'normal',
                                fontWeight: 500,
                                fontSize: '16px',
                                lineHeight: '150%',
                                letterSpacing: '-0.02em',
                                background: 'radial-gradient(613.83% 540.91% at 50% 10.42%, #FF7549 0%, #FF5620 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                margin: 0
                            }}
                        >
                            AI-based
                        </span>
                    </div>

                    {/* Title Container */}
                    <div 
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '0px',
                            gap: '25px',
                            width: '1348px',
                            height: 'auto'
                        }}
                    >
                        {/* First Line: "Calculate Success" */}
                        <div 
                            className="landing-hero-row"
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                                padding: '0px',
                                gap: '8px',
                                width: '1348px',
                                height: '51px'
                            }}
                        >
                            <h1 
                                style={{
                                    fontFamily: 'Onest',
                                    fontStyle: 'normal',
                                    fontWeight: 600,
                                    fontSize: '72px',
                                    lineHeight: '120%',
                                    textAlign: 'center',
                                    letterSpacing: '-0.04em',
                                    color: '#1D2433',
                                    margin: 0
                                }}
                            >
                                {t('landingHero')}
                            </h1>
                        </div>

                        {/* Second Line: "with GameGlory" */}
                        <div 
                            className="landing-hero-row"
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                                padding: '0px',
                                gap: '8px',
                                width: '1348px',
                                height: '51px'
                            }}
                        >
                            <h1 
                                style={{
                                    fontFamily: 'Onest',
                                    fontStyle: 'normal',
                                    fontWeight: 600,
                                    fontSize: '72px',
                                    lineHeight: '120%',
                                    textAlign: 'center',
                                    letterSpacing: '-0.04em',
                                    color: '#1D2433',
                                    margin: 0
                                }}
                            >
                                {t('landingHeroWith')}
                            </h1>
                            <h1 
                                style={{
                                    fontFamily: 'Onest',
                                    fontStyle: 'normal',
                                    fontWeight: 600,
                                    fontSize: '72px',
                                    lineHeight: '120%',
                                    textAlign: 'center',
                                    letterSpacing: '-0.04em',
                                    background: 'radial-gradient(613.83% 540.91% at 50% 10.42%, #FF7549 0%, #FF5620 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    margin: 0
                                }}
                            >
                                GameGlory
                            </h1>
                        </div>
                    </div>

                    {/* Subtitle */}
                    <p 
                        className="landing-hero-subtitle"
                        style={{
                            fontFamily: 'Onest',
                            fontStyle: 'normal',
                            fontWeight: 500,
                            fontSize: '16px',
                            lineHeight: '140%',
                            textAlign: 'center',
                            letterSpacing: '-0.02em',
                            color: '#1D2433',
                            width: '600px',
                            height: 'auto',
                            margin: 0,
                            marginTop: '24px'
                        }}
                    >
                        {t('landingSubtitle')}
                    </p>

                    {/* CTA Buttons */}
                    <div
                        className="landing-hero-ctas"
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            padding: '0px',
                            gap: '12px',
                            width: '175px',
                            height: '44px'
                        }}
                    >
                        <button 
                            onClick={onGetStarted}
                            className="gg-gradient-btn"
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '12px 24px',
                                gap: '6px',
                                width: '175px',
                                height: '44px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <span 
                                style={{
                                    fontFamily: 'Onest',
                                    fontStyle: 'normal',
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    lineHeight: '20px',
                                    textAlign: 'center',
                                    letterSpacing: '-0.02em',
                                    textTransform: 'uppercase',
                                    color: '#1D2433',
                                    margin: 0
                                }}
                            >
                                {t('tryItForFree')}
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 md:px-12">
                <style>{`
                    
                    .features-container {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        padding: 0px;
                        gap: 20px;
                        width: 960px;
                        height: 424px;
                    }
                    
                    .feature-card {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 4px;
                        gap: 20px;
                        width: 306.67px;
                        height: 424px;
                        background: #FFFFFF;
                        border-radius: 20px;
                        flex: 1;
                        font-family: 'Onest', sans-serif;
                    }
                    
                    .feature-card-image {
                        width: 298.67px;
                        height: 240px;
                        border-radius: 16px;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        object-fit: cover;
                        background: radial-gradient(100.11% 155.04% at 0% 0%, #EEF2F8 0%, #F4F6FB 100%);
                        flex: none;
                        align-self: stretch;
                    }
                    
                    .feature-card-content {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 0px 12px 12px;
                        gap: 12px;
                        width: 298.67px;
                        height: 156px;
                        flex: none;
                        align-self: stretch;
                    }
                    
                    .feature-card-title {
                        width: 274.67px;
                        font-family: 'Onest';
                        font-weight: 500;
                        font-size: 20px;
                        line-height: 110%;
                        letter-spacing: -0.02em;
                        text-transform: uppercase;
                        color: #1D2433;
                        flex: none;
                        align-self: stretch;
                    }
                    
                    .feature-card-description {
                        width: 274.67px;
                        font-family: 'Onest';
                        font-weight: 500;
                        font-size: 16px;
                        line-height: 140%;
                        letter-spacing: -0.02em;
                        color: #6B7488;
                        flex: none;
                        align-self: stretch;
                    }

                    @media (max-width: 1023px) {
                        .features-container {
                            width: 100%;
                            height: auto;
                            flex-direction: column;
                            gap: 16px;
                        }

                        .feature-card {
                            width: 100%;
                            max-width: 520px;
                            height: auto;
                        }

                        .feature-card-image,
                        .feature-card-content,
                        .feature-card-title,
                        .feature-card-description {
                            width: 100%;
                            height: auto;
                        }
                    }
                `}</style>
                
                <div className="max-w-7xl mx-auto flex justify-center">
                    <div className="features-container" style={{ position: 'relative', zIndex: 10 }}>
                        {/* Feature 1 */}
                        <div className="feature-card">
                            <img src={ChartIcon} alt="market snapshot" className="feature-card-image" />
                            <div className="feature-card-content">
                                <h3 className="feature-card-title">
                                    {t('marketSnapshotTitle')}
                                </h3>
                                <p className="feature-card-description">
                                    {t('marketSnapshotDesc')}
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="feature-card">
                            <img src={Card2Icon} alt="real references" className="feature-card-image" />
                            <div className="feature-card-content">
                                <h3 className="feature-card-title">
                                    {t('realReferencesTitle')}
                                </h3>
                                <p className="feature-card-description">
                                    {t('realReferencesDesc')}
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="feature-card">
                            <img src={Card3Icon} alt="recommendations" className="feature-card-image" />
                            <div className="feature-card-content">
                                <h3 className="feature-card-title">
                                    {t('recommendationsTitle')}
                                </h3>
                                <p className="feature-card-description">
                                    {t('recommendationsDesc')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-[#F4F6FB]">
                <style>{`
                    .how-it-works-block {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        padding: 120px 32px;
                        gap: 48px;
                        width: 1380px;
                        height: 482px;
                        border-radius: 24px;
                    }
                    
                    .how-it-works-title {
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        align-items: flex-start;
                        padding: 0px;
                        gap: 8px;
                        width: 1316px;
                        height: 28px;
                        font-family: 'Onest';
                        font-weight: 600;
                        font-size: 40px;
                        line-height: 120%;
                        text-align: center;
                        letter-spacing: -0.05em;
                        color: #1D2433;
                    }
                    
                    .how-it-works-steps {
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        align-items: flex-start;
                        padding: 0px;
                        gap: 20px;
                        isolation: isolate;
                        width: 1316px;
                        height: 166px;
                        position: relative;
                    }
                    
                    .step-widget {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        padding: 0px;
                        gap: 24px;
                        width: 340px;
                        height: 144px;
                        position: relative;
                    }
                    
                    .step-widget.step-2 {
                        height: 166px;
                    }
                    
                    .step-widget.step-3 {
                        height: 166px;
                    }
                    
                    .step-icon-container {
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        align-items: center;
                        padding: 8px;
                        gap: 10px;
                        width: 64px;
                        height: 64px;
                        border-radius: 20px;
                        flex: none;
                        z-index: 0;
                    }
                    
                    .step-icon-container.step-1 {
                        background: rgba(229, 40, 98, 0.12);
                    }
                    
                    .step-icon-container.step-2 {
                        background: #FF56201F;
                    }
                    
                    .step-icon-container.step-3 {
                        background: #1D332F;
                    }
                    
                    .step-icon {
                        width: 32px;
                        height: 32px;
                    }
                    
                    .step-content {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 0px;
                        gap: 12px;
                        width: 340px;
                        flex: none;
                        align-self: stretch;
                    }
                    
                    .step-content.step-2,
                    .step-content.step-3 {
                        height: 78px;
                    }
                    
                    .step-title {
                        width: 340px;
                        font-family: 'Onest';
                        font-weight: 500;
                        font-size: 20px;
                        line-height: 110%;
                        text-align: center;
                        letter-spacing: -0.02em;
                        text-transform: uppercase;
                        color: #1D2433;
                        flex: none;
                        align-self: stretch;
                    }
                    
                    .step-description {
                        width: 340px;
                        font-family: 'Onest';
                        font-weight: 500;
                        font-size: 16px;
                        line-height: 140%;
                        text-align: center;
                        letter-spacing: -0.02em;
                        color: #6B7488;
                        flex: none;
                        align-self: stretch;
                    }
                    
                    .how-line {
                        position: absolute;
                        width: 180px;
                        height: 1px;
                        top: calc(50% - 51px);
                        background: repeating-linear-gradient(
                            90deg,
                            rgba(255, 255, 255, 0.5) 0px 8px,
                            transparent 8px 16px
                        );
                        flex: none;
                    }
                    
                    .how-line.line-1 {
                        left: 388px;
                        opacity: 0.32;
                        z-index: 3;
                    }
                    
                    .how-line.line-2 {
                        left: 748px;
                        opacity: 0.2;
                        z-index: 4;
                    }
                    
                    .how-dot {
                        position: absolute;
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        top: 28px;
                        flex: none;
                    }
                    
                    .how-dot.dot-1 {
                        left: 384px;
                        background: #E52862;
                        z-index: 5;
                    }
                    
                    .how-dot.dot-2 {
                        left: 564px;
                        background: #FF5620;
                        z-index: 6;
                    }
                    
                    .how-dot.dot-3 {
                        left: 744px;
                        background: #FF5620;
                        z-index: 7;
                    }
                    
                    .how-dot.dot-4 {
                        left: 924px;
                        background: #3AD867;
                        z-index: 8;
                    }

                    @media (max-width: 1200px) {
                        .how-it-works-block {
                            width: 100%;
                            height: auto;
                            padding: 96px 16px;
                        }

                        .how-it-works-title,
                        .how-it-works-steps {
                            width: 100%;
                        }
                    }

                    @media (max-width: 767px) {
                        .how-it-works-block {
                            padding: 72px 16px;
                            gap: 28px;
                        }

                        .how-it-works-title {
                            font-size: 30px;
                            height: auto;
                        }

                        .how-it-works-steps {
                            height: auto;
                            flex-direction: column;
                            align-items: center;
                            gap: 20px;
                        }

                        .step-widget,
                        .step-widget.step-2,
                        .step-widget.step-3,
                        .step-content,
                        .step-content.step-2,
                        .step-content.step-3,
                        .step-title,
                        .step-description {
                            width: 100%;
                            max-width: 340px;
                            height: auto;
                        }

                        .step-title {
                            font-size: 18px;
                        }

                        .step-description {
                            font-size: 14px;
                        }

                        .how-line,
                        .how-dot {
                            display: none;
                        }
                    }
                `}</style>
                
                <div className="flex justify-center">
                    <div className="how-it-works-block">
                        <div className="how-it-works-title">
                            {t('howItWorksTitle')}
                        </div>
                        
                        <div className="how-it-works-steps">
                            {/* Step 1 - Describe */}
                            <div className="step-widget">
                                <div className="step-icon-container step-1">
                                    <img src={HowWork1Icon} alt="describe" className="step-icon" />
                                </div>
                                <div className="step-content">
                                    <h3 className="step-title">
                                        {t('stepDescribe')}
                                    </h3>
                                    <p className="step-description">
                                        {t('stepDescribeText')}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Step 2 - Refine */}
                            <div className="step-widget step-2">
                                <div className="step-icon-container step-2">
                                    <img src={HowWork2Icon} alt="refine" className="step-icon" />
                                </div>
                                <div className="step-content step-2">
                                    <h3 className="step-title">
                                        {t('stepRefine')}
                                    </h3>
                                    <p className="step-description">
                                        {t('stepRefineText')}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Step 3 - Explore */}
                            <div className="step-widget step-3">
                                <div className="step-icon-container step-3">
                                    <img src={HowWork3Icon} alt="explore" className="step-icon" />
                                </div>
                                <div className="step-content step-3">
                                    <h3 className="step-title">
                                        {t('stepExplore')}
                                    </h3>
                                    <p className="step-description">
                                        {t('stepExploreText')}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Connecting lines */}
                            <div className="how-line line-1"></div>
                            <div className="how-line line-2"></div>
                            
                            {/* Progress dots */}
                            <div className="how-dot dot-1"></div>
                            <div className="how-dot dot-2"></div>
                            <div className="how-dot dot-3"></div>
                            <div className="how-dot dot-4"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Describe Section */}
            <section className="bg-[#F4F6FB]">
                <style>{`
                    .describe-block {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        padding: 0px 32px;
                        gap: 48px;
                        isolation: isolate;
                        width: 1380px;
                        height: 740px;
                        border-radius: 24px;
                        position: relative;
                    }
                    
                    .describe-blur-bg {
                        position: absolute;
                        width: 610px;
                        height: 422px;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, calc(-50% - 8px));
                        border-radius: 12px;
                        z-index: 0;
                    }
                    
                    .describe-blur-bg.blur-1 {
                        background: linear-gradient(0deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), linear-gradient(102.15deg, #E52862 -16.32%, #FF6230 46.23%, #FFC132 108.78%);
                        filter: blur(6px);
                        z-index: 0;
                    }
                    
                    .describe-blur-bg.blur-2 {
                        background: linear-gradient(0deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0.32)), linear-gradient(102.15deg, #E52862 -16.32%, #FF6230 46.23%, #FFC132 108.78%);
                        filter: blur(16px);
                        z-index: 1;
                    }
                    
                    .describe-blur-bg.blur-3 {
                        background: radial-gradient(ellipse at 0% 1.14%, #FF7549 0%, #FF5620 100%);
                        filter: blur(40px);
                        z-index: 2;
                    }
                    
                    .describe-title {
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        align-items: flex-start;
                        padding: 0px;
                        gap: 8px;
                        width: 1316px;
                        height: 28px;
                        font-family: 'Onest';
                        font-weight: 600;
                        font-size: 40px;
                        line-height: 120%;
                        text-align: center;
                        letter-spacing: -0.05em;
                        color: #1D2433;
                        position: relative;
                        z-index: 3;
                    }
                    
                    .describe-content {
                        width: 1316px;
                        height: 429px;
                        position: relative;
                        z-index: 4;
                    }
                    
                    .describe-side {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        padding: 0px;
                        gap: 24px;
                        position: absolute;
                        width: 305px;
                        height: 78px;
                    }
                    
                    .describe-side.left-top {
                        left: 7px;
                        top: 107.5px;
                    }
                    
                    .describe-side.left-bottom {
                        left: 7px;
                        top: 243.5px;
                    }
                    
                    .describe-side.right-top {
                        right: 4px;
                        top: 107.5px;
                    }
                    
                    .describe-side.right-bottom {
                        right: 0px;
                        top: 243.5px;
                    }
                    
                    .describe-text-block {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-end;
                        padding: 0px;
                        gap: 12px;
                        width: 280px;
                        height: 78px;
                    }
                    
                    .describe-text-block.right-align {
                        align-items: flex-end;
                    }
                    
                    .describe-text-block.left-align {
                        align-items: flex-start;
                    }
                    
                    .describe-label {
                        width: 280px;
                        font-family: 'Onest';
                        font-weight: 500;
                        font-size: 20px;
                        line-height: 110%;
                        letter-spacing: -0.02em;
                        text-transform: uppercase;
                        color: #1D2433;
                    }
                    
                    .describe-side.left-top .describe-label,
                    .describe-side.left-bottom .describe-label {
                        text-align: right;
                    }
                    
                    .describe-description {
                        width: 280px;
                        font-family: 'Onest';
                        font-weight: 500;
                        font-size: 16px;
                        line-height: 140%;
                        letter-spacing: -0.02em;
                        color: #6B7488;
                    }
                    
                    .describe-side.left-top .describe-description,
                    .describe-side.left-bottom .describe-description {
                        text-align: right;
                    }
                    
                    .describe-divider {
                        width: 1px;
                        height: 78px;
                        background: #FFFFFF;
                    }
                    
                    .describe-laptop {
                        position: absolute;
                        width: 760px;
                        height: 436.55px;
                        left: 50%;
                        top: 0px;
                        transform: translateX(-50%);
                    }
                    
                    .describe-cta {
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        align-items: center;
                        padding: 12px 24px;
                        gap: 6px;
                        width: 175px;
                        height: 44px;
                        background: radial-gradient(100% 7302.48% at 0% 1.14%, #FF7549 0%, #FF5620 100%);
                        border-radius: 12px;
                        position: relative;
                        z-index: 5;
                        border: none;
                        cursor: pointer;
                        font-family: 'Onest';
                        font-weight: 600;
                        font-size: 16px;
                        line-height: 20px;
                        text-align: center;
                        letter-spacing: -0.02em;
                        text-transform: uppercase;
                        color: #1D2433;
                        transition: all 0.3s ease;
                    }
                    
                    .describe-cta:hover {
                        background: linear-gradient(0deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12)),
                                    radial-gradient(100% 7302.48% at 0% 1.14%, #FF7549 0%, #FF5620 100%);
                    }

                    .landing-auth-btn {
                        transition: background-color 0.3s ease;
                    }

                    .landing-auth-btn:hover {
                        background: #CCD6E6 !important;
                    }

                    @media (max-width: 1200px) {
                        .describe-block {
                            width: 100%;
                            height: auto;
                            padding: 0 16px 48px;
                        }

                        .describe-title,
                        .describe-content {
                            width: 100%;
                        }
                    }

                    @media (max-width: 767px) {
                        .describe-block {
                            gap: 28px;
                            padding-bottom: 56px;
                        }

                        .describe-title {
                            font-size: 30px;
                            height: auto;
                        }

                        .describe-content {
                            height: auto;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 16px;
                        }

                        .describe-blur-bg {
                            display: none;
                        }

                        .describe-center-illustration {
                            position: static !important;
                            order: 1;
                            width: 100%;
                        }

                        .describe-center-illustration img {
                            width: 100% !important;
                            max-width: 520px;
                            height: auto !important;
                        }

                        .describe-side {
                            position: static;
                            width: 100%;
                            max-width: 520px;
                            height: auto;
                            gap: 0;
                        }

                        .describe-divider {
                            display: none;
                        }

                        .describe-text-block,
                        .describe-label,
                        .describe-description {
                            width: 100%;
                            height: auto;
                            text-align: left !important;
                        }

                        .describe-text-block.right-align,
                        .describe-text-block.left-align {
                            align-items: flex-start;
                        }

                        .describe-side.left-top,
                        .describe-side.left-bottom,
                        .describe-side.right-top,
                        .describe-side.right-bottom {
                            left: auto;
                            right: auto;
                            top: auto;
                        }

                        .describe-cta {
                            width: 100%;
                            max-width: 520px;
                        }
                    }
                `}</style>
                
                <div className="flex justify-center">
                    <div className="describe-block">
                        {/* Background blurs */}
                        <div className="describe-blur-bg blur-1"></div>
                        <div className="describe-blur-bg blur-2"></div>
                        <div className="describe-blur-bg blur-3"></div>
                        
                        {/* Title */}
                        <div className="describe-title">
                            {t('describeYourGame')}
                        </div>
                        
                        {/* Content with icon and text */}
                        <div className="describe-content">
                            {/* Left side - Top */}
                            <div className="describe-side left-top">
                                <div className="describe-text-block right-align">
                                    <div className="describe-label">{t('gameOverview')}</div>
                                    <div className="describe-description">{t('gameOverviewDesc')}</div>
                                </div>
                                <div className="describe-divider"></div>
                            </div>
                            
                            {/* Left side - Bottom */}
                            <div className="describe-side left-bottom">
                                <div className="describe-text-block right-align">
                                    <div className="describe-label">{t('tagsLabel')}</div>
                                    <div className="describe-description">{t('tagsDesc')}</div>
                                </div>
                                <div className="describe-divider"></div>
                            </div>
                            
                            {/* Center - Icon */}
                            <div className="describe-center-illustration absolute inset-0 flex items-center justify-center z-10">
                            <img 
                                src={DescrIcon} 
                                alt="describe" 
                                className="w-[95%] h-[429px]"
                            />
                            </div>

                            
                            {/* Right side - Top */}
                            <div className="describe-side right-top">
                                <div className="describe-divider"></div>
                                <div className="describe-text-block left-align">
                                    <div className="describe-label">{t('drafting')}</div>
                                    <div className="describe-description">{t('draftingDesc')}</div>
                                </div>
                            </div>
                            
                            {/* Right side - Bottom */}
                            <div className="describe-side right-bottom">
                                <div className="describe-divider"></div>
                                <div className="describe-text-block left-align">
                                    <div className="describe-label">{t('autoUpdate')}</div>
                                    <div className="describe-description">{t('autoUpdateDesc')}</div>
                                </div>
                            </div>
                        </div>
                        
                        {/* CTA Button */}
                        <button 
                            onClick={onGetStarted}
                            className="describe-cta"
                        >
                            {t('tryItForFree')}
                        </button>
                    </div>
                </div>
            </section>

            {/* Advantages Section */}
            <section 
                className="landing-advantages flex flex-col justify-center items-center py-20 px-8 gap-12 bg-[#F4F6FB]"
                style={{
                    borderRadius: '24px'
                }}
            >
                <div className="flex flex-row justify-center items-start gap-2 w-full max-w-[1316px]">
                    <h2 
                        className="landing-section-title font-semibold text-[40px] leading-[120%] text-center tracking-[-0.05em] text-white"
                        style={{
                            fontFamily: 'Onest',
                            leadingTrim: 'both',
                            textEdge: 'cap'
                        }}
                    >
                        {t('advantagesTitle').split('GameGlory')[0]}
                    </h2>
                    <h2 
                        className="landing-section-title font-semibold text-[40px] leading-[120%] text-center tracking-[-0.05em]"
                        style={{
                            fontFamily: 'Onest',
                            background: 'radial-gradient(613.83% 540.91% at 50% 10.42%, #FF7549 0%, #FF5620 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            leadingTrim: 'both',
                            textEdge: 'cap'
                        }}
                    >
                        GameGlory
                    </h2>
                </div>
                
                <div className="flex flex-col lg:flex-row items-center gap-5 w-full max-w-[960px]">
                    {/* Left Column */}
                    <div className="flex flex-col justify-center items-start gap-5 w-full lg:w-[470px]">
                        {/* Advantage 1 */}
                        <div 
                            className="flex flex-col items-start p-4 gap-5 w-full bg-[#FFFFFF]"
                            style={{
                                height: '178px',
                                borderRadius: '20px'
                            }}
                        >
                           <div 
                                className="flex justify-center items-center p-2 bg-[rgba(255,98,48,0.12)]"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '8px'
                                }}
                            >
                                <img 
                                    src={DatabaseIcon} 
                                    alt="Database" 
                                    className="w-6 h-6"
                                />
                            </div>
                            <div className="flex flex-col items-start gap-3 w-full">
                                <h3 
                                    className="font-medium text-[20px] leading-[110%] tracking-[-0.02em] uppercase text-white w-full"
                                    style={{ fontFamily: 'Onest' }}
                                >
                                    {t('dataFromSteam')}
                                </h3>
                                <p 
                                    className="font-medium text-[16px] leading-[140%] tracking-[-0.02em] text-[#6B7488] w-full"
                                    style={{ fontFamily: 'Onest' }}
                                >
                                    {t('dataFromSteamDesc')}
                                </p>
                            </div>
                        </div>

                        {/* Advantage 2 */}
                        <div 
                            className="flex flex-col items-start p-4 gap-5 w-full bg-[#FFFFFF]"
                            style={{
                                height: '178px',
                                borderRadius: '20px'
                            }}
                        >
                            <div 
                                className="flex justify-center items-center p-2 bg-[rgba(255,98,48,0.12)]"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '8px'
                                }}
                            >
                                <img 
                                    src={StarShineIcon} 
                                    alt="AI Assistant" 
                                    className="w-6 h-6"
                                />
                            </div>
                            <div className="flex flex-col items-start gap-3 w-full">
                                <h3 
                                    className="font-medium text-[20px] leading-[110%] tracking-[-0.02em] uppercase text-white"
                                    style={{ fontFamily: 'Onest' }}
                                >
                                    {t('aiAssistant')}
                                </h3>
                                <p 
                                    className="font-medium text-[16px] leading-[140%] tracking-[-0.02em] text-[#6B7488] w-full"
                                    style={{ fontFamily: 'Onest' }}
                                >
                                    {t('aiAssistantDesc')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col justify-center items-start gap-5 w-full lg:w-[470px]">
                        {/* Advantage 3 */}
                        <div 
                            className="flex flex-col items-start p-4 gap-5 w-full bg-[#FFFFFF]"
                            style={{
                                height: '178px',
                                borderRadius: '20px'
                            }}
                        >
                            <div 
                                className="flex justify-center items-center p-2 bg-[rgba(255,98,48,0.12)]"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '8px'
                                }}
                            >
                                <img 
                                    src={FinanceIcon} 
                                    alt="Finance" 
                                    className="w-6 h-6"
                                />
                            </div>
                            <div className="flex flex-col items-start gap-3 w-full">
                                <h3 
                                    className="font-medium text-[20px] leading-[110%] tracking-[-0.02em] uppercase text-white w-full"
                                    style={{ fontFamily: 'Onest' }}
                                >
                                    {t('comprehensiveAnalytics')}
                                </h3>
                                <p 
                                    className="font-medium text-[16px] leading-[140%] tracking-[-0.02em] text-[#6B7488] w-full"
                                    style={{ fontFamily: 'Onest' }}
                                >
                                    {t('comprehensiveAnalyticsDesc')}
                                </p>
                            </div>
                        </div>

                        {/* Advantage 4 */}
                        <div 
                            className="flex flex-col items-start p-4 gap-5 w-full bg-[#FFFFFF]"
                            style={{
                                height: '178px',
                                borderRadius: '20px'
                            }}
                        >
                            <div 
                                className="flex justify-center items-center p-2 bg-[rgba(255,98,48,0.12)]"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '8px'
                                }}
                            >
                                <img 
                                    src={CodeBlocksIcon} 
                                    alt="Active Development" 
                                    className="w-6 h-6"
                                />
                            </div>
                            <div className="flex flex-col items-start gap-3 w-full">
                                <h3 
                                    className="font-medium text-[20px] leading-[110%] tracking-[-0.02em] uppercase text-white w-full"
                                    style={{ fontFamily: 'Onest' }}
                                >
                                    {t('activeDevelopment')}
                                </h3>
                                <p 
                                    className="font-medium text-[16px] leading-[140%] tracking-[-0.02em] text-[#6B7488] w-full"
                                    style={{ fontFamily: 'Onest' }}
                                >
                                    {t('activeDevelopmentDesc')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section 
                className="landing-faq-section flex flex-col justify-center items-center py-20 px-8 gap-12 bg-[#F4F6FB]"
                style={{ borderRadius: '24px' }}
            >
                <style>{`
                    @media (max-width: 1023px) {
                        .landing-faq-section {
                            padding-left: 16px;
                            padding-right: 16px;
                        }

                        .landing-faq-section > div,
                        .landing-faq-section details,
                        .landing-faq-section details h3,
                        .landing-faq-section details p {
                            width: 100% !important;
                            max-width: 960px !important;
                            height: auto !important;
                        }

                        .landing-faq-section details > summary > div:first-child {
                            width: 100% !important;
                            max-width: none !important;
                            flex: 1 1 auto !important;
                        }

                        .landing-faq-section details > summary > div:last-child {
                            width: 40px !important;
                            height: 40px !important;
                            min-width: 40px !important;
                            flex: 0 0 40px !important;
                            padding: 6px !important;
                            gap: 0 !important;
                        }

                        .landing-faq-section details > summary > div:last-child svg {
                            width: 20px !important;
                            height: 20px !important;
                        }
                    }

                    @media (max-width: 767px) {
                        .landing-faq-section {
                            gap: 24px;
                            padding-top: 72px;
                            padding-bottom: 72px;
                        }

                        .landing-faq-section h2 {
                            font-size: 30px !important;
                        }

                        .landing-faq-section details {
                            border-radius: 16px !important;
                            padding: 14px !important;
                        }

                        .landing-faq-section details h3 {
                            font-size: 16px !important;
                            line-height: 120% !important;
                        }

                        .landing-faq-section details p {
                            font-size: 14px !important;
                            line-height: 145% !important;
                        }
                    }
                `}</style>
                <div className="flex flex-row justify-center items-start w-full max-w-[960px]">
                    <h2 
                        className="font-semibold text-[40px] leading-[120%] text-center tracking-[-0.05em] text-white"
                        style={{
                            fontFamily: 'Onest',
                            leadingTrim: 'both',
                            textEdge: 'cap'
                        }}
                    >
                        {t('faqTitle')}
                    </h2>
                </div>
                
                <div 
                    className="flex flex-col justify-center items-start gap-5 w-full max-w-[960px]"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        padding: '0px',
                        gap: '20px',
                        width: '960px',
                        height: 'auto'
                    }}
                >
                    {/* FAQ Item 1 - Collapsed by default */}
                    <details 
                        className="flex flex-col items-start w-full bg-[#FFFFFF] group"
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            padding: '16px',
                            gap: '20px',
                            width: '960px',
                            height: 'auto',
                            background: '#FFFFFF',
                            borderRadius: '20px'
                        }}
                    >
                        <summary 
                            className="flex flex-row items-start justify-between gap-5 w-full cursor-pointer list-none"
                            style={{ 
                                WebkitUserSelect: 'none', 
                                userSelect: 'none',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                padding: '0px',
                                gap: '20px',
                                width: '100%'
                            }}
                        >
                            <div 
                                className="flex flex-col items-start gap-3 flex-grow"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    padding: '0px',
                                    gap: '12px',
                                    width: '860px',
                                    height: 'auto'
                                }}
                            >
                                <h3 
                                    className="font-medium text-[20px] leading-[110%] tracking-[-0.02em] uppercase text-white"
                                    style={{ 
                                        fontFamily: 'Onest',
                                        width: '860px',
                                        height: 'auto'
                                    }}
                                >
                                    {t('faqPredictQuestion')}
                                </h3>
                                <p 
                                    className="font-medium text-[16px] leading-[140%] tracking-[-0.02em] text-[#6B7488] group-open:block hidden"
                                    style={{ 
                                        fontFamily: 'Onest',
                                        width: '860px',
                                        height: 'auto'
                                    }}
                                >
                                    {t('faqPredictAnswer')}
                                </p>
                            </div>
                            <div 
                                className="flex justify-center items-center flex-shrink-0"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: '8px',
                                    gap: '10px',
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    borderRadius: '8px'
                                }}
                            >
                                <ChevronUp 
                                    className="w-6 h-6 text-white transition-transform group-open:rotate-0 rotate-180"
                                    style={{ flexShrink: 0 }}
                                />
                            </div>
                        </summary>
                    </details>

                    {/* FAQ Item 2 */}
                    <details 
                        className="flex flex-col items-start w-full bg-[#FFFFFF] group"
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            padding: '16px',
                            gap: '20px',
                            width: '960px',
                            height: 'auto',
                            background: '#FFFFFF',
                            borderRadius: '20px'
                        }}
                    >
                        <summary 
                            className="flex flex-row items-start justify-between gap-5 w-full cursor-pointer list-none"
                            style={{ 
                                WebkitUserSelect: 'none', 
                                userSelect: 'none',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                padding: '0px',
                                gap: '20px',
                                width: '100%'
                            }}
                        >
                            <div 
                                className="flex flex-col items-start gap-3 flex-grow"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    padding: '0px',
                                    gap: '12px',
                                    width: '860px',
                                    height: 'auto'
                                }}
                            >
                                <h3 
                                    className="font-medium text-[20px] leading-[110%] tracking-[-0.02em] uppercase text-white"
                                    style={{ 
                                        fontFamily: 'Onest',
                                        width: '860px',
                                        height: 'auto'
                                    }}
                                >
                                    {t('faqDescriptionQuestion')}
                                </h3>
                                <p 
                                    className="font-medium text-[16px] leading-[140%] tracking-[-0.02em] text-[#6B7488] group-open:block hidden"
                                    style={{ 
                                        fontFamily: 'Onest',
                                        width: '860px',
                                        height: 'auto'
                                    }}
                                >
                                    {t('faqDescriptionAnswer')}
                                </p>
                            </div>
                            <div 
                                className="flex justify-center items-center flex-shrink-0"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: '8px',
                                    gap: '10px',
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    borderRadius: '8px'
                                }}
                            >
                                <ChevronUp 
                                    className="w-6 h-6 text-white transition-transform group-open:rotate-0 rotate-180"
                                    style={{ flexShrink: 0 }}
                                />
                            </div>
                        </summary>
                    </details>

                    {/* FAQ Item 3 */}
                    <details 
                        className="flex flex-col items-start w-full bg-[#FFFFFF] group"
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            padding: '16px',
                            gap: '20px',
                            width: '960px',
                            height: 'auto',
                            background: '#FFFFFF',
                            borderRadius: '20px'
                        }}
                    >
                        <summary 
                            className="flex flex-row items-start justify-between gap-5 w-full cursor-pointer list-none"
                            style={{ 
                                WebkitUserSelect: 'none', 
                                userSelect: 'none',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                padding: '0px',
                                gap: '20px',
                                width: '100%'
                            }}
                        >
                            <div 
                                className="flex flex-col items-start gap-3 flex-grow"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    padding: '0px',
                                    gap: '12px',
                                    width: '860px',
                                    height: 'auto'
                                }}
                            >
                                <h3 
                                    className="font-medium text-[20px] leading-[110%] tracking-[-0.02em] uppercase text-white"
                                    style={{ 
                                        fontFamily: 'Onest',
                                        width: '860px',
                                        height: 'auto'
                                    }}
                                >
                                    {t('faqExportQuestion')}
                                </h3>
                                <p 
                                    className="font-medium text-[16px] leading-[140%] tracking-[-0.02em] text-[#6B7488] group-open:block hidden"
                                    style={{ 
                                        fontFamily: 'Onest',
                                        width: '860px',
                                        height: 'auto'
                                    }}
                                >
                                    {t('faqExportAnswer')}
                                </p>
                            </div>
                            <div 
                                className="flex justify-center items-center flex-shrink-0"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: '8px',
                                    gap: '10px',
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    borderRadius: '8px'
                                }}
                            >
                                <ChevronUp 
                                    className="w-6 h-6 text-white transition-transform group-open:rotate-0 rotate-180"
                                    style={{ flexShrink: 0 }}
                                />
                            </div>
                        </summary>
                    </details>

                    {/* FAQ Item 4 */}
                    <details 
                        className="flex flex-col items-start w-full bg-[#FFFFFF] group"
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            padding: '16px',
                            gap: '20px',
                            width: '960px',
                            height: 'auto',
                            background: '#FFFFFF',
                            borderRadius: '20px'
                        }}
                    >
                        <summary 
                            className="flex flex-row items-start justify-between gap-5 w-full cursor-pointer list-none"
                            style={{ 
                                WebkitUserSelect: 'none', 
                                userSelect: 'none',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                padding: '0px',
                                gap: '20px',
                                width: '100%'
                            }}
                        >
                            <div 
                                className="flex flex-col items-start gap-3 flex-grow"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    padding: '0px',
                                    gap: '12px',
                                    width: '860px',
                                    height: 'auto'
                                }}
                            >
                                <h3 
                                    className="font-medium text-[20px] leading-[110%] tracking-[-0.02em] uppercase text-white"
                                    style={{ 
                                        fontFamily: 'Onest',
                                        width: '860px',
                                        height: 'auto'
                                    }}
                                >
                                    {t('faqIterateQuestion')}
                                </h3>
                                <p 
                                    className="font-medium text-[16px] leading-[140%] tracking-[-0.02em] text-[#6B7488] group-open:block hidden"
                                    style={{ 
                                        fontFamily: 'Onest',
                                        width: '860px',
                                        height: 'auto'
                                    }}
                                >
                                    {t('faqIterateAnswer')}
                                </p>
                            </div>
                            <div 
                                className="flex justify-center items-center flex-shrink-0"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: '8px',
                                    gap: '10px',
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    borderRadius: '8px'
                                }}
                            >
                                <ChevronUp 
                                    className="w-6 h-6 text-white transition-transform group-open:rotate-0 rotate-180"
                                    style={{ flexShrink: 0 }}
                                />
                            </div>
                        </summary>
                    </details>

                    {/* FAQ Item 5 */}
                    <details 
                        className="flex flex-col items-start w-full bg-[#FFFFFF] group"
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            padding: '16px',
                            gap: '20px',
                            width: '960px',
                            height: 'auto',
                            background: '#FFFFFF',
                            borderRadius: '20px'
                        }}
                    >
                        <summary 
                            className="flex flex-row items-start justify-between gap-5 w-full cursor-pointer list-none"
                            style={{ 
                                WebkitUserSelect: 'none', 
                                userSelect: 'none',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                padding: '0px',
                                gap: '20px',
                                width: '100%'
                            }}
                        >
                            <div 
                                className="flex flex-col items-start gap-3 flex-grow"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    padding: '0px',
                                    gap: '12px',
                                    width: '860px',
                                    height: 'auto'
                                }}
                            >
                                <h3 
                                    className="font-medium text-[20px] leading-[110%] tracking-[-0.02em] uppercase text-white"
                                    style={{ 
                                        fontFamily: 'Onest',
                                        width: '860px',
                                        height: 'auto'
                                    }}
                                >
                                    {t('faqPublicQuestion')}
                                </h3>
                                <p 
                                    className="font-medium text-[16px] leading-[140%] tracking-[-0.02em] text-[#6B7488] group-open:block hidden"
                                    style={{ 
                                        fontFamily: 'Onest',
                                        width: '860px',
                                        height: 'auto'
                                    }}
                                >
                                    {t('faqPublicAnswer')}
                                </p>
                            </div>
                            <div 
                                className="flex justify-center items-center flex-shrink-0"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: '8px',
                                    gap: '10px',
                                    width: '48px',
                                    height: '48px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    borderRadius: '8px'
                                }}
                            >
                                <ChevronUp 
                                    className="w-6 h-6 text-white transition-transform group-open:rotate-0 rotate-180"
                                    style={{ flexShrink: 0 }}
                                />
                            </div>
                        </summary>
                    </details>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="landing-final-cta w-full bg-[#F4F6FB] py-20 px-8 flex justify-center">
            {/* Центрирующий контейнер */}
            <div className="w-full max-w-[960px] flex flex-col items-center gap-12">

                {/* Заголовок */}
                <h2
                className="landing-section-title text-white text-center"
                style={{
                    fontFamily: 'Onest, sans-serif',
                    fontWeight: 600,
                    fontSize: '40px',
                    lineHeight: '120%',
                    letterSpacing: '-0.05em',
                    margin: 0
                }}
                >
                {t('suggestionsTitle')}
                </h2>

                {/* Кнопки */}
                <div className="flex flex-wrap justify-center gap-3">

                {/* Let us know */}
                <button
                    onClick={() => window.location.href = 'mailto:gameglory@gmail.com'}
                    className="h-[44px] px-6 rounded-xl uppercase text-white font-semibold transition-colors gg-gradient-btn"
                    style={{
                    fontFamily: 'Onest, sans-serif',
                    fontSize: '16px'
                    }}
                >
                    {t('letUsKnow')}
                </button>

                {/* Email */}
                <a
                    href="mailto:gameglory@gmail.com"
                    className="h-[44px] px-4 flex items-center gap-2 rounded-xl border text-white transition-colors"
                    style={{
                    fontFamily: 'Onest, sans-serif',
                    fontSize: '16px',
                    borderColor: 'rgba(255,255,255,0.4)'
                    }}
                    onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)')
                    }
                    onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')
                    }
                >
                    <MessageSquareText size={20} opacity={0.4} />
                    <span>gameglory@gmail.com</span>
                </a>

                </div>
            </div>
            </section>

        </div>
    );
};


