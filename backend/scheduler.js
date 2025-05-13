// job scheduler for scraping
import schedule from 'node-schedule';
import { getCommentsOnOthers } from './linkedin.js';

// Helper to check time windows in CET/CEST
function withinWindow(sh, sm, eh, em) {
  const now = new Date();
  const start = new Date(now).setHours(sh, sm, 0);
  const end   = new Date(now).setHours(eh, em, 0);
  return now >= start && now <= end;
}

export function scheduleJobs() {
  // Every 10 min Mon–Sat, morning, lunch, evening windows
  const windows = [
    [7, 30, 9, 30],
    [12, 30, 15, 15],
    [17, 0, 19, 0]
  ];
  windows.forEach(([sh, sm, eh, em]) => {
    schedule.scheduleJob({ minute: new schedule.Range(0, 59, 10), dayOfWeek: new schedule.Range(1,6), hour: new schedule.Range(sh, eh) }, async () => {
      if (withinWindow(sh, sm, eh, em)) {
        console.log(`Running scrape for window ${sh}:${sm}–${eh}:${em}`);
        await getCommentsOnOthers(/* load your target list here */);
      }
    });
  });
}
