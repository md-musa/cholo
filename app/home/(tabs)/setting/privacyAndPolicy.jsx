import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PrivacyPolicyScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>🛡️ Privacy Policy</Text>

        <Text style={{ color: "gray", fontSize: 12, marginBottom: 20 }}>Effective Date: [Insert Date]</Text>

        <Text style={styles.heading}>📍 Location Data</Text>

        <Text style={styles.subheading}>1. Foreground Location Access</Text>
        <Text style={styles.text}>We use your location while the app is open to:</Text>
        <BulletList
          items={[
            "Show your position on the map.",
            "Help you track buses in real-time.",
            "Provide navigation and route-based features.",
          ]}
        />

        <Text style={styles.subheading}>2. Background Location Access</Text>
        <Text style={styles.text}>
          With your permission, we may access your location even when the app is not actively in use:
        </Text>
        <BulletList
          items={[
            "Allow bus drivers or users to broadcast location during trips.",
            "Ensure real-time tracking for students depending on live updates.",
          ]}
        />

        <Text style={styles.note}>
          You can enable or disable location access at any time from your device settings. Disabling background access
          may limit certain features.
        </Text>

        <Text style={styles.heading}>🔐 Data Usage</Text>
        <BulletList
          items={[
            "We do not store personal location data unless required for active tracking.",
            "Data is used only for display and real-time updates.",
            "We do not share your location with third parties.",
          ]}
        />

        <Text style={styles.heading}>🔄 Policy Updates</Text>
        <Text style={styles.text}>We may occasionally update this policy. Changes will be notified in the app.</Text>

        <Text style={styles.heading}>📞 Contact Us</Text>
        <Text style={styles.text}>For any questions, reach us at:</Text>
        <Text style={styles.text}>Email: your-support-email@example.com</Text>

        <Text style={{ marginTop: 20, fontWeight: "bold" }}>
          By using this app, you agree to the terms of this Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const BulletList = ({ items }) => (
  <View style={{ paddingLeft: 15, marginBottom: 10 }}>
    {items.map((item, idx) => (
      <Text key={idx} style={styles.bullet}>
        • {item}
      </Text>
    ))}
  </View>
);

const styles = {
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  subheading: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  text: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  note: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#555",
    marginBottom: 10,
  },
  bullet: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
};

export default PrivacyPolicyScreen;
