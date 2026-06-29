import { useEffect, useState } from "react";
import { METRICS, Scores, SEED_VISITS, Visit, todayIso } from "./data";
import { useLiff } from "./liff";
import {
  HomeIcon,
  RecordIcon,
  ChangeIcon,
  RewardIcon,
  MenuIcon,
} from "./components/icons";
import { HomeScreen } from "./screens/HomeScreen";
import { RecordScreen } from "./screens/RecordScreen";
import { ChangeScreen } from "./screens/ChangeScreen";
import { RewardScreen } from "./screens/RewardScreen";
import { MenuScreen } from "./screens/MenuScreen";
import { Toast } from "./components/Toast";

export type Tab = "home" | "record" | "change" | "reward" | "menu";

const TABS: { key: Tab; label: string; Icon: typeof HomeIcon; accent?: boolean }[] =
  [
    { key: "home", label: "ホーム", Icon: HomeIcon },
    { key: "change", label: "変化", Icon: ChangeIcon },
    { key: "record", label: "記録", Icon: RecordIcon, accent: true },
    { key: "reward", label: "特典", Icon: RewardIcon },
    { key: "menu", label: "メニュー", Icon: MenuIcon },
  ];

export function App() {
  const [visits, setVisits] = useState<Visit[]>(SEED_VISITS);
  const [tab, setTab] = useState<Tab>("home");
  const [toast, setToast] = useState<string | null>(null);
  const { inClient, profile } = useLiff();

  // LINEの中ではLINE自身の枠が付くので、プロト用のスマホ枠は外して全画面表示にする
  const framed = !inClient;
  useEffect(() => {
    document.body.classList.toggle("in-liff", inClient);
  }, [inClient]);

  const recordedToday = visits.some((v) => v.date.slice(0, 10) === todayIso());

  function go(t: Tab) {
    setTab(t);
  }

  function saveVisit(scores: Scores) {
    const visit: Visit = { date: todayIso(), scores };
    setVisits((prev) => {
      // 同日記録は上書き（QR=来店確定は1日1回想定のデモ）
      const others = prev.filter((v) => v.date.slice(0, 10) !== todayIso());
      return [...others, visit];
    });
    setToast(`記録しました。来店${visits.filter((v) => v.date.slice(0, 10) !== todayIso()).length + 1}回目です。`);
    setTab("change");
  }

  function resetDemo(mode: "first" | "seed") {
    setVisits(mode === "first" ? [] : SEED_VISITS);
    setTab("home");
    setToast(mode === "first" ? "初回の状態にしました。" : "デモデータに戻しました。");
  }

  return (
    <div className={framed ? "phone" : "app-fullbleed"}>
      {framed && (
        <div className="liff-bar">
          <span>9:41</span>
          <span className="liff-title">ON:U · LINE</span>
          <span>●●●</span>
        </div>
      )}

      <main className="screen" key={tab}>
        <div className="screen-fade">
          {tab === "home" && (
            <HomeScreen
              visits={visits}
              recordedToday={recordedToday}
              go={go}
              userName={profile?.displayName ?? null}
            />
          )}
          {tab === "record" && (
            <RecordScreen
              metrics={METRICS}
              visitNumber={
                visits.filter((v) => v.date.slice(0, 10) !== todayIso()).length + 1
              }
              onSave={saveVisit}
            />
          )}
          {tab === "change" && <ChangeScreen visits={visits} go={go} />}
          {tab === "reward" && <RewardScreen visits={visits} />}
          {tab === "menu" && <MenuScreen onReset={resetDemo} />}
        </div>
      </main>

      <nav className="tabbar">
        {TABS.map(({ key, label, Icon, accent }) => (
          <button
            key={key}
            className={`tab${tab === key ? " active" : ""}${accent ? " accent" : ""}`}
            onClick={() => go(key)}
            aria-current={tab === key ? "page" : undefined}
          >
            <Icon size={23} />
            <span className="label">{label}</span>
          </button>
        ))}
      </nav>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
