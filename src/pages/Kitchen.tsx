import { ChefHat, CircleAlert } from 'lucide-react';

export default function Kitchen() {
  return <main className="module-page"><div className="module-heading"><div><div className="eyebrow">OPERATIONS · KITCHEN</div><h1>Kitchen tickets</h1><p>KOT queue and preparation status for the selected branch.</p></div></div>
    <section className="module-card kitchen-gap-card"><div className="kitchen-gap-icon"><ChefHat size={22}/></div><div><h2>Kitchen workflow needs its backend module</h2><p>The current API completes paid orders immediately and does not expose kitchen ticket creation or preparation status updates. The queue will become live when those KOT endpoints are available.</p></div><div className="kitchen-gap-note"><CircleAlert size={16}/> No kitchen tickets are being hidden or simulated.</div></section>
  </main>;
}
