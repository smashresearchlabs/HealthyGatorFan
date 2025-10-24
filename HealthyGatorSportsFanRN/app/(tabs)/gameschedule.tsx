import React, { useEffect, useState } from "react";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { TeamLogo } from "@/components/getTeamImages";
import User from "@/components/user";
import { AppUrls } from "@/constants/AppUrls";
import { Abbreviations } from "@/constants/Abbreviations";
import GlobalStyles from "../styles/GlobalStyles";

type Game = {
  week: number;
  startDate: string;
  venue: string;
  homeTeam: string;
  homeConference: string;
  homePoints: number | null;
  awayTeam: string;
  awayConference: string;
  awayPoints: number | null;
};

export default function GameSchedule() {
  const insets = useSafeAreaInsets();
  const [bottomH, setBottomH] = useState(0);
  const navigation = useNavigation();
  const route = useRoute();
  const user: any = route.params;
  const currentUser: User = user.currentUser.cloneUser();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const resp = await getSchedule();
        if (resp && resp.data) setData(resp.data);
      } catch (e: any) {
        setError("Failed to load schedule");
        console.log("Error fetching game data:", e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (

    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.container}>
        <View style={GlobalStyles.topMenu}>
          <Image source={require("./../../assets/images/clipboardgator.png")} style={{ width: 55, height: 55 }} />
          <Text style={{ fontSize: 25, fontFamily: "System", color: colors.ufBlue, fontWeight: "700" }}>
            Game Schedule
          </Text>
          <TouchableOpacity
            style={GlobalStyles.topIcons}
            activeOpacity={0.5}
            onPress={() => NavigateToNotifications(currentUser, navigation)}
          >
            <Image source={require("./../../assets/images/bell.png")} style={{ width: 40, height: 40, alignSelf: "center", objectFit: "contain" }} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingTop: 6,
            paddingBottom: bottomH + 24,   
          }}
          showsVerticalScrollIndicator={false}
        >
          {loading && (
            <View style={styles.stateBox}>
              <ActivityIndicator size="small" />
              <Text style={styles.stateText}>Loading schedule…</Text>
            </View>
          )}
          {!loading && error && (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>{error}</Text>
            </View>
          )}
          {!loading && !error && data.length === 0 && (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>No games found.</Text>
            </View>
          )}

          {data.map((g, idx) => (
            <View key={`${g.week}-${idx}`} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>Week {g.week}</Text>
                <View style={styles.underline} />
                <Text style={styles.dateText}>{formatDateTime(g.startDate)}</Text>
              </View>

              <View style={styles.row}>
                <View style={[styles.teamCol, { alignItems: "flex-start" }]}>
                  <Image source={TeamLogo.GetImage(getAbbr(g.awayTeam)?.toLowerCase() || "")} style={styles.teamLogo} resizeMode="contain" />
                  <Text style={styles.teamName} numberOfLines={1}>{getAbbr(g.awayTeam)}</Text>
                  <Text style={styles.confText}>{getConfAbbr(g.awayConference)}</Text>
                </View>

                <View style={styles.centerCol}>
                  <Text style={styles.vsText}>{isFuture(g.startDate) ? "at" : "vs"}</Text>
                  <ResultPill game={g} />
                </View>

                <View style={[styles.teamCol, { alignItems: "flex-end" }]}>
                  <Image source={TeamLogo.GetImage(getAbbr(g.homeTeam)?.toLowerCase() || "")} style={styles.teamLogo} resizeMode="contain" />
                  <Text style={styles.teamName} numberOfLines={1}>{getAbbr(g.homeTeam)}</Text>
                  <Text style={styles.confText}>{getConfAbbr(g.homeConference)}</Text>
                </View>
              </View>

              <View style={styles.footerWrap}>
                <Text style={styles.scoreText}>{scoreText(g)}</Text>
                <Text style={styles.venueText}>{g.venue}</Text>
              </View>
            </View>
          ))}
          <View style={{ height: 12 }} />
        </ScrollView>

        <View
          onLayout={(e) => setBottomH(e.nativeEvent.layout.height)}
          style={[
            GlobalStyles.bottomMenu,
            {
              bottom: 0,
              left: 0,
              right: 0,
              paddingBottom: insets.bottom,
              backgroundColor: "#FFFFFF",
            },
          ]}
        >
          <TouchableOpacity style={GlobalStyles.bottomIcons} activeOpacity={0.5}
            onPress={() => NavigateToHomePage(currentUser, navigation)}>
            <Image source={require("../../assets/images/bottomHomeMenu/homeIcon.png")} style={styles.tabIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={GlobalStyles.bottomIcons} activeOpacity={0.5}>
            <Image source={require("../../assets/images/bottomHomeMenu/calendarIcon.png")} style={styles.tabIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={GlobalStyles.bottomIcons} activeOpacity={0.5}
            onPress={() => NavigateToHomePage(currentUser, navigation)}>
            <Image source={require("../../assets/images/bottomHomeMenu/plus.png")} style={{ width: 45, height: 45, alignSelf: "center", objectFit: "contain" }} />
          </TouchableOpacity>
          <TouchableOpacity style={GlobalStyles.bottomIcons} activeOpacity={0.5}
            onPress={() => NavigateToProfileManagement(currentUser, navigation)}>
            <Image source={require("../../assets/images/bottomHomeMenu/defaultprofile.png")} style={styles.tabIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={GlobalStyles.bottomIcons} activeOpacity={0.5}
            onPress={() => LogoutPopup(navigation)}>
            <Image source={require("../../assets/images/bottomHomeMenu/logoutIcon.png")} style={styles.tabIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function LogoutPopup(navigation: any) {
  Alert.alert("Confirmation", "Are you sure you want logout?", [
    { text: "Cancel", style: "cancel" },
    { text: "Logout", style: "destructive", onPress: () => navigation.navigate("CreateOrSignIn" as never) },
  ]);
}
function NavigateToHomePage(currentUser: any, navigation: any) {
  navigation.navigate("HomePage", { currentUser } as never);
}
function NavigateToNotifications(currentUser: any, navigation: any) {
  navigation.navigate("NotificationsPage", { currentUser } as never);
}
function NavigateToProfileManagement(currentUser: any, navigation: any) {
  navigation.navigate("ProfileManagement", { currentUser } as never);
}

export const getSchedule = async () => {
  try {
    const response = await fetch(`${AppUrls.url}/schedule-tile/`, {
      method: "GET",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (response.ok) return data;
  } catch (error) {
    console.log("Encountered error while retrieving game schedule: ", error);
    return { error };
  }
};

const getAbbr = (name: string): string | null => Abbreviations[name] || null;

const getConfAbbr = (conf: string): string => {
  const map: Record<string, string> = {
    "American Athletic": "AAC",
    "Atlantic Coast Conference": "ACC",
    "Big Ten": "B10",
    "Big 12": "B12",
    "Conference USA": "CUSA",
    "Southeastern Conference": "SEC",
  };
  return map[conf] || conf;
};

const isFuture = (iso: string) => new Date(iso).getTime() > Date.now();

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
  return `${date} • ${time}`;
};

const scoreText = (g: Game) => {
  const hasScore = Number.isFinite(g.homePoints) && Number.isFinite(g.awayPoints);
  if (!hasScore) return isFuture(g.startDate) ? "Scheduled" : "Final (score unavailable)";
  return `${g.awayTeam} ${g.awayPoints}  —  ${g.homeTeam} ${g.homePoints}`;
};

const ResultPill = ({ game }: { game: Game }) => {
  const hasScore = Number.isFinite(game.homePoints) && Number.isFinite(game.awayPoints);
  if (!hasScore) {
    return (
      <View style={[styles.pill, { backgroundColor: "#F3F4F6" }]}>
        <Text style={[styles.pillText, { color: "#6B7280" }]}>
          {isFuture(game.startDate) ? "Upcoming" : "TBD"}
        </Text>
      </View>
    );
  }
  const ufIsHome = game.homeTeam === "Florida";
  const ufScore = ufIsHome ? (game.homePoints as number) : (game.awayPoints as number);
  const oppScore = ufIsHome ? (game.awayPoints as number) : (game.homePoints as number);
  const win = ufScore > oppScore;
  const tie = ufScore === oppScore;
  const bg = tie ? "#E5E7EB" : win ? colors.ufOrange : "#E11D48";
  const fg = tie ? "#111827" : "white";
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{tie ? "TIE" : win ? "WIN" : "LOSS"}</Text>
    </View>
  );
};

const colors = {
  ufBlue: "#0B3D91",
  ufOrange: "#F24E1E",
  cardShadow: "#000",
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7FB" },
  tabIcon: { width: 30, height: 30, alignSelf: "center", objectFit: "contain" },
  stateBox: { paddingTop: 40, alignItems: "center" },
  stateText: { color: "#6B7280", marginTop: 8 },
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: { alignItems: "center", marginBottom: 8 },
  cardHeaderText: { fontSize: 18, fontWeight: "800", color: colors.ufBlue },
  underline: {
    height: 4,
    width: 60,
    backgroundColor: colors.ufOrange,
    borderRadius: 999,
    marginTop: 6,
    marginBottom: 8,
  },
  dateText: { fontSize: 13, color: "#6B7280" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  teamCol: { width: "40%" },
  teamLogo: { width: 68, height: 68, marginBottom: 6 },
  teamName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  confText: { color: "#6B7280", marginTop: 2 },
  centerCol: { width: "20%", alignItems: "center", gap: 8 },
  vsText: { fontSize: 16, fontWeight: "700", color: "#111827" },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
    minWidth: 80,
    alignItems: "center",
  },
  pillText: { fontSize: 12, fontWeight: "800", textAlign: "center" },
  footerWrap: { marginTop: 12, alignItems: "center" },
  scoreText: { fontWeight: "700", color: "#111827", textAlign: "center", width: "100%" },
  venueText: { color: "#6B7280", fontStyle: "italic", marginTop: 4, textAlign: "center", width: "100%" },
});
