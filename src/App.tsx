import { useParkStore } from './store/useParkStore';
import ParkCanvas from './components/ParkCanvas';
import CompanyPanel from './components/CompanyPanel';
import TalentMarketplace from './components/TalentMarketplace';

export default function App() {
  const view = useParkStore((s) => s.view);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {view === 'park' && <ParkCanvas />}
      {view === 'company' && <CompanyPanel />}
      {view === 'talent' && <TalentMarketplace />}
    </div>
  );
}
