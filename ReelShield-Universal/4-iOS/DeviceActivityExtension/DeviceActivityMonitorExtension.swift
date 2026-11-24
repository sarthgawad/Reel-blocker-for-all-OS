import DeviceActivity
import ManagedSettings
import Foundation

/**
 * Monitors app launch thresholds and triggers shields when limits are hit.
 */
class DeviceActivityMonitorExtension: DeviceActivityMonitor {
    
    let store = ManagedSettingsStore()
    
    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
        // Reset daily limits
    }
    
    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        // Clear shields if schedule permits
    }
    
    override func eventDidReachThreshold(for event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
        super.eventDidReachThreshold(for: event, activity: activity)
        // Shield the apps
    }
}
