import fs from 'fs';
import path from 'path';

function updateFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;
    
    for (const [target, replacement] of replacements) {
        content = content.replace(target, replacement);
    }
    
    if (content !== original) {
        if (!content.includes('import DigitalClock')) {
            // Find the last import
            const lastImportIndex = content.lastIndexOf('import ');
            const nextLineIndex = content.indexOf('\n', lastImportIndex) + 1;
            content = content.slice(0, nextLineIndex) + "import DigitalClock from './DigitalClock';\n" + content.slice(nextLineIndex);
        }
        fs.writeFileSync(filePath, content);
        console.log('Updated ' + filePath);
    }
}

// 1. CTClockView.tsx
updateFile('components/CTClockView.tsx', [
    ["{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}", "<DigitalClock date={currentTime} showSeconds />"]
]);

// 2. CalendarView.tsx
updateFile('components/CalendarView.tsx', [
    ["{e.start.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}", "<DigitalClock date={e.start} />"],
    ["{e.start.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}", "<DigitalClock date={e.start} />"],
    ["{e.start.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}", "<DigitalClock date={e.start} />"]
]);

// 3. IncidentLogView.tsx
updateFile('components/IncidentLogView.tsx', [
    ["{incDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}", "<DigitalClock date={incDate} />"]
]);

// 4. RosterView.tsx
updateFile('components/RosterView.tsx', [
    ["{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}", "<DigitalClock date={new Date()} />"]
]);

// 5. SettingsView.tsx
updateFile('components/SettingsView.tsx', [
    ["{syncMeta.lastRun ? new Date(syncMeta.lastRun).toLocaleTimeString() : 'Never'}", "{syncMeta.lastRun ? <DigitalClock date={new Date(syncMeta.lastRun)} showSeconds /> : 'Never'}"],
    ["{syncMeta.nextRun ? new Date(syncMeta.nextRun).toLocaleTimeString() : 'Top of next hour'}", "{syncMeta.nextRun ? <DigitalClock date={new Date(syncMeta.nextRun)} showSeconds /> : 'Top of next hour'}"]
]);

// 6. StockView.tsx
updateFile('components/StockView.tsx', [
    ["{new Date().toLocaleTimeString('en-NZ', { timeStyle: 'short' })}", "<DigitalClock date={new Date()} />"]
]);

// 7. TimeclockView.tsx
updateFile('components/TimeclockView.tsx', [
    ["{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}", "<DigitalClock date={currentTime} showSeconds />"]
]);

// 8. WeatherView.tsx
updateFile('components/WeatherView.tsx', [
    ["{lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}", "<DigitalClock date={lastRefreshed} />"]
]);

