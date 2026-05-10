import HeroSection from './landing/HeroSection';
import MasterSection from './landing/MasterSection';
import FutureSection from './landing/FutureSection';
import WorkflowSection from './landing/WorkflowSection';
import CommunitySection from './landing/CommunitySection';
import ProSection from './landing/ProSection';
import FounderSection from './landing/FounderSection';
import FinalCtaSection from './landing/FinalCtaSection';
import FooterSection from './landing/Footer';

export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <div id="master"><MasterSection /></div>
      <FutureSection />
      <div id="workflow"><WorkflowSection /></div>
      <div id="community"><CommunitySection /></div>
      <div id="pro"><ProSection /></div>
      <FounderSection />
      <FinalCtaSection />
      <FooterSection />

      {/* Responsive overrides for landing page grid sections */}
      <style>{`
        @media (max-width: 768px) {
          .landing-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .landing-grid-3 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
