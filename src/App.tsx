import { useCallback, useEffect, useState } from "react";
import { METRICS, Scores, Visit, todayIso } from "./data";
import { useLiff } from "./liff";
import { fetchVisits, resetVisits, saveTodayVisit } from "./api";
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
import { Wordmark } from "./components/Wordmark";

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
  const { ready, inClient, profile } = useLiff();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("home");
  const [toast, setToast] = useState<string | null>(null);

  // 本人特定：LINE内ならLINEのユーザーID、ブラウザ確認時は 'demo'。
  const lineUserId = ready ? profile?.userId ?? "demo" : null;
  const displayName = profile?.displayName ?? (lineUserId === "demo" ? "ゲスト" : null);

  const framed = !inClient;
  useEffect(() => {
    document.body.classList.toggle("in-liff", inClient);
  }, [inClient]);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    try {
      setVisits(await fetchVisits(id));
    } catch (e) {
      console.error("fetchVisits failed", e);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (lineUserId) load(lineUserId);
  }, [lineUserId, load]);

  const recordedToday = visits.some((v) => v.date.slice(0, 10) === todayIso());

  function go(t: Tab) {
    setTab(t);
  }

  async function saveVisit(scores: Scores) {
    if (!lineUserId) return;
    try {
      await saveTodayVisit(lineUserId, displayName, scores);
      const fresh = await fetchVisits(lineUserId);
      setVisits(fresh);
      setToast(`記録しました。来店${fresh.length}回目です。`);
      setTab("change");
    } catch (e) {
      console.error("saveVisit failed", e);
      setToast("保存に失敗しました。通信を確認してもう一度お試しください。");
    }
  }

  async function resetDemo(mode: "first" | "seed") {
    if (!lineUserId) return;
    try {
      await resetVisits(lineUserId, displayName, mode);
      await load(lineUserId);
      setTab("home");
      setToast(mode === "first" ? "初回の状態にしました。" : "4回来店の状態に戻しました。");
    } catch (e) {
      console.error("resetDemo failed", e);
      setToast("切り替えに失敗しました。");
    }
  }

  const visitNumber = visits.filter((v) => v.date.slice(0, 10) !== todayIso()).length + 1;

  return (
    <div className={framed ? "phone" : "app-fullbleed"}>
      {framed && (
        <div className="liff-bar">
          <span>9:41</span>
          <span className="liff-title">ON:U · LINE</span>
          <span>●●●</span>
        </div>
      )}

      <main className="screen" key={loading ? "loading" : tab}>
        {loading ? (
          <div className="app-loading">
            <Wordmark />
            <p className="muted">読み込み中…</p>
          </div>
        ) : (
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
                visitNumber={visitNumber}
                onSave={saveVisit}
              />
            )}
            {tab === "change" && <ChangeScreen visits={visits} go={go} />}
            {tab === "reward" && <RewardScreen visits={visits} />}
            {tab === "menu" && <MenuScreen onReset={resetDemo} />}
          </div>
        )}
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
