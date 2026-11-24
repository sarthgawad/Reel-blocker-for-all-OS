import SwiftUI
import FamilyControls
import ManagedSettings

struct ContentView: View {
    @EnvironmentObject var model: ScreenTimeModel
    @State private var ytBlocked = true
    @State private var igBlocked = true
    @State private var fbBlocked = true

    var body: some View {
        ZStack {
            Color(red: 11/255, green: 15/255, blue: 25/255)
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("ReelShield iOS")
                                .font(.system(size: 26, weight: .bold))
                                .foregroundColor(.white)
                            Text("Apple Screen Time & Safari Shield")
                                .font(.system(size: 13))
                                .foregroundColor(.gray)
                        }
                        Spacer()
                        Text(model.isAuthorized ? "Active" : "Pending")
                            .font(.system(size: 12, weight: .bold))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(model.isAuthorized ? Color.green.opacity(0.2) : Color.orange.opacity(0.2))
                            .foregroundColor(model.isAuthorized ? .green : .orange)
                            .cornerRadius(20)
                    }
                    .padding(.top, 16)

                    // The requested Rectangular Bar with Circular Bordered Number
                    VStack(alignment: .leading, spacing: 14) {
                        Text("TODAY'S DEFENSE STATS")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.gray)

                        HStack(spacing: 14) {
                            // Circular Bordered Number
                            ZStack {
                                Circle()
                                    .stroke(Color.green, lineWidth: 2.5)
                                    .frame(width: 44, height: 44)
                                    .background(Circle().fill(Color(red: 30/255, green: 41/255, blue: 59/255)))
                                    .shadow(color: Color.green.opacity(0.4), radius: 6)

                                Text("\(model.totalReelsAvoided)")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(.white)
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                Text("Reels Shielded Today")
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundColor(.white)
                                Text("Instagram, YouTube & Facebook")
                                    .font(.system(size: 12))
                                    .foregroundColor(.gray)
                            }
                            Spacer()
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(
                            RoundedRectangle(cornerRadius: 30) // Pill rectangular bar
                                .fill(Color(red: 15/255, green: 23/255, blue: 42/255))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 30)
                                        .stroke(Color.indigo.opacity(0.4), lineWidth: 1.5)
                                )
                        )

                        // Platform Metrics
                        HStack(spacing: 12) {
                            metricBadge(title: "YT Shorts", count: model.ytShortsAvoided, color: .red)
                            metricBadge(title: "Insta Reels", count: model.igReelsAvoided, color: .purple)
                            metricBadge(title: "FB Reels", count: model.fbReelsAvoided, color: .blue)
                        }
                    }
                    .padding(18)
                    .background(Color(red: 21/255, green: 29/255, blue: 47/255))
                    .cornerRadius(18)

                    // Apple Screen Time Controls
                    VStack(alignment: .leading, spacing: 14) {
                        Text("SCREEN TIME NATIVE SHIELD")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.gray)

                        Toggle("Shield YouTube App", isOn: $ytBlocked)
                            .tint(.indigo)
                        Toggle("Shield Instagram App", isOn: $igBlocked)
                            .tint(.indigo)
                        Toggle("Shield Facebook App", isOn: $fbBlocked)
                            .tint(.indigo)
                    }
                    .foregroundColor(.white)
                    .padding(18)
                    .background(Color(red: 21/255, green: 29/255, blue: 47/255))
                    .cornerRadius(18)

                    // Safari Mobile Extension Info
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Image(systemName: "safari.fill")
                                .foregroundColor(.cyan)
                            Text("iOS Safari Web Extension Included")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(.white)
                        }
                        Text("For mobile web browsing, enable the ReelShield Safari extension in Settings > Safari > Extensions to enjoy the exact floating counter pill bar on your iPhone.")
                            .font(.system(size: 12))
                            .foregroundColor(.gray)
                    }
                    .padding(16)
                    .background(Color(red: 15/255, green: 23/255, blue: 42/255))
                    .cornerRadius(14)

                    // User requested attractive "Made by Sarth" badge
                    Text("✨ Made with ❤️ by Sarth")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundStyle(
                            LinearGradient(
                                colors: [Color.indigo, Color.purple],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .padding(.top, 10)
                        .padding(.bottom, 20)
                }
                .padding(.horizontal, 20)
            }
        }
    }

    private func metricBadge(title: String, count: Int, color: Color) -> some View {
        VStack(spacing: 4) {
            Text("\(count)")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(color)
            Text(title)
                .font(.system(size: 11))
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(Color.black.opacity(0.2))
        .cornerRadius(10)
    }
}
