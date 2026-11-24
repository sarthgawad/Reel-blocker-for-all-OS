import ManagedSettings
import ManagedSettingsUI
import UIKit

/**
 * Customizes the Apple Screen Time Shield Screen when a reel or app is blocked.
 */
class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    
    override func configuration(shielding application: Application) -> ShieldConfiguration {
        return ShieldConfiguration(
            backgroundBlurStyle: .systemMaterialDark,
            backgroundColor: UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 0.95),
            icon: UIImage(systemName: "shield.checkered"),
            title: ShieldConfiguration.Label(text: "ReelShield Focus Active", color: .white),
            subtitle: ShieldConfiguration.Label(text: "Protecting your time from mindless scrolling.", color: .lightGray),
            primaryButtonLabel: ShieldConfiguration.Label(text: "Stay Focused", color: .white),
            primaryButtonBackgroundColor: UIColor(red: 99/255, green: 102/255, blue: 241/255, alpha: 1.0)
        )
    }
}
