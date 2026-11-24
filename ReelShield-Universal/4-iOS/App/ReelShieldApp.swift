import SwiftUI
import FamilyControls

@main
struct ReelShieldApp: App {
    @StateObject var model = ScreenTimeModel()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(model)
        }
    }
}

class ScreenTimeModel: ObservableObject {
    @Published var isAuthorized: Bool = false
    @Published var totalReelsAvoided: Int = 0
    @Published var ytShortsAvoided: Int = 0
    @Published var igReelsAvoided: Int = 0
    @Published var fbReelsAvoided: Int = 0

    init() {
        checkAuthorization()
    }

    func checkAuthorization() {
        if #available(iOS 16.0, *) {
            Task {
                do {
                    try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
                    DispatchQueue.main.async {
                        self.isAuthorized = true
                    }
                } catch {
                    print("Screen Time authorization error: \(error)")
                }
            }
        }
    }
}
