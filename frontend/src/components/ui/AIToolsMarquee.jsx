import chatgpt from '../../images/aitoolslogo/chatgpt_ai_logo.jpg';
import claude from '../../images/aitoolslogo/claude_ai_logo.jpg';
import google from '../../images/aitoolslogo/Google_ai_logo.jpg';
import gemini from '../../images/aitoolslogo/Gemini_ai_logo.jpg';
import copilot from '../../images/aitoolslogo/copilot_ai_logo.jpg';
import deepseek from '../../images/aitoolslogo/deepseek_ai_logo.jpg';
import perplexity from '../../images/aitoolslogo/perplexity_ai_logo.jpg';
import grok from '../../images/aitoolslogo/Grok_ai_logo.jpg';
import heygen from '../../images/aitoolslogo/Heygen_ai_logo.jpg';
import elevenlabs from '../../images/aitoolslogo/Elevenlabs_ai_logo.jpg';
import lovable from '../../images/aitoolslogo/Lovable_ai_logo.jpg';
import make from '../../images/aitoolslogo/Make_ai_logo.jpg';
import n8n from '../../images/aitoolslogo/n8n_ai_logo.jpg';
import canva from '../../images/aitoolslogo/Canva_ai_logo.jpg';

const AI_LOGOS = [
  chatgpt, claude, google, gemini, copilot, deepseek,
  perplexity, grok, heygen, elevenlabs, lovable, make, n8n, canva,
];

export default function AIToolsMarquee({ className = '' }) {
  return (
    <div className={`ai-tools-marquee ${className}`}>
      <div className="ai-tools-marquee-bg" />
      <div className="ai-tools-marquee-track">
        <div className="ai-tools-marquee-content">
          {AI_LOGOS.map((src, i) => (
            <img key={i} src={src} alt="" className="ai-tool-logo" />
          ))}
        </div>
        <div className="ai-tools-marquee-content">
          {AI_LOGOS.map((src, i) => (
            <img key={`dup-${i}`} src={src} alt="" className="ai-tool-logo" />
          ))}
        </div>
      </div>
    </div>
  );
}
