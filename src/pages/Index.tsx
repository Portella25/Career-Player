import { Activity, CalendarDays, Dumbbell, Heart, Megaphone, RotateCcw, Shield, Trophy, Users, WalletCards } from "lucide-react";
import type { TrainingFocus } from "@/domain/career";
import { useCareerStore } from "@/state/careerStore";

const trainingOptions: Array<{ focus: TrainingFocus; label: string; detail: string }> = [
  { focus: "finishing", label: "Finalização", detail: "+1 FIN · -7 energia" },
  { focus: "passing", label: "Passe", detail: "+1 PAS · -7 energia" },
  { focus: "pace", label: "Explosão", detail: "+1 VEL · -7 energia" },
  { focus: "stamina", label: "Resistência", detail: "+1 RES · -4 energia" },
  { focus: "mentality", label: "Mental", detail: "+1 MEN · -7 energia" },
];

const phaseLabel = {
  training: "Treino",
  match: "Partida",
  life: "Vida",
  recovery: "Recuperação",
};

const attributeLabels: Record<TrainingFocus, string> = {
  finishing: "Finalização",
  passing: "Passe",
  pace: "Velocidade",
  stamina: "Resistência",
  mentality: "Mentalidade",
};

const Index = () => {
  const { career, train, playMatch, chooseLifeEvent, recover, resetCareer } = useCareerStore();
  const { player, calendar, lastMatch, ledger, pendingLifeEvent, relationships } = career;
  const primaryAction = calendar.phase === "match" ? playMatch : calendar.phase === "recovery" ? recover : undefined;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-5 py-5">
        <header className="flex items-center justify-between pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Season {calendar.season}</p>
            <h1 className="text-2xl font-black leading-tight">Football Life</h1>
          </div>
          <button
            type="button"
            onClick={resetCareer}
            className="grid h-10 w-10 place-items-center rounded-md border border-border bg-secondary text-secondary-foreground"
            aria-label="Reset career"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </header>

        <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{player.club}</p>
              <h2 className="text-3xl font-black leading-none">{player.name}</h2>
              <p className="mt-2 text-sm font-semibold text-accent-foreground">{player.age} anos · {player.position}</p>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Trophy className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Semana</p>
              <p className="text-xl font-black">{calendar.week}</p>
            </div>
            <div className="rounded-md bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Energia</p>
              <p className="text-xl font-black">{player.energy}</p>
            </div>
            <div className="rounded-md bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Fama</p>
              <p className="text-xl font-black">{player.reputation}</p>
            </div>
          </div>

          <div className="mt-3 rounded-md bg-muted p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-bold">{phaseLabel[calendar.phase]}</p>
              </div>
              <p className="text-sm font-black">vs {calendar.nextOpponent}</p>
            </div>
          </div>
        </div>

        <section className="py-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black">Atributos</h2>
            <span className="rounded-md bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">Forma {player.form}</span>
          </div>
          <div className="space-y-3">
            {Object.entries(player.attributes).map(([name, value]) => (
              <div key={name} className="grid grid-cols-[92px_1fr_32px] items-center gap-3">
                <span className="text-sm text-muted-foreground">{attributeLabels[name as TrainingFocus]}</span>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
                </div>
                <span className="text-right text-sm font-black">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-auto space-y-3 pb-3">
          {calendar.phase === "training" ? (
            <div className="grid grid-cols-2 gap-2">
              {trainingOptions.map((option) => (
                <button
                  key={option.focus}
                  type="button"
                  onClick={() => train(option.focus)}
                  className="min-h-16 rounded-md border border-border bg-secondary px-3 py-3 text-left text-secondary-foreground last:col-span-2"
                >
                  <span className="block text-sm font-black">{option.label}</span>
                  <span className="mt-1 block text-xs font-bold text-muted-foreground">{option.detail}</span>
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={primaryAction}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-base font-black text-primary-foreground"
            >
              {calendar.phase === "match" ? <Shield className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
              {calendar.phase === "match" ? "Jogar partida" : "Recuperar"}
            </button>
          )}

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <WalletCards className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-bold">Carteira</p>
              </div>
              <p className="font-black">€{ledger.balance}</p>
            </div>
            {lastMatch && (
              <div className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
                <p className="font-bold text-foreground">Último jogo: {lastMatch.teamGoals}–{lastMatch.opponentGoals} vs {lastMatch.opponent}</p>
                <p>{lastMatch.goals} gol(s), {lastMatch.assists} assistência(s), nota {lastMatch.playerRating}</p>
                <div className="mt-3 space-y-2">
                  {lastMatch.events.slice(0, 3).map((event) => (
                    <div key={`${lastMatch.id}-${event.minute}-${event.label}`} className="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2">
                      <span className="font-bold text-foreground">{event.minute}'</span>
                      <span className="flex-1">{event.label}</span>
                      <span className={event.impact > 0 ? "font-black text-primary" : "font-black text-muted-foreground"}>{event.impact > 0 ? `+${event.impact}` : event.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-bold">Histórico recente</p>
              </div>
              <p className="text-xs font-bold text-muted-foreground">Ganho €{ledger.totalEarned}</p>
            </div>
            <div className="space-y-2">
              {career.matchHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma partida disputada.</p>
              ) : (
                career.matchHistory.slice(0, 4).map((match) => (
                  <div key={match.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm">
                    <span className="truncate text-muted-foreground">{match.opponent}</span>
                    <span className="font-black">{match.teamGoals}-{match.opponentGoals}</span>
                    <span className="rounded-sm bg-muted px-2 py-1 text-xs font-black">{match.playerRating}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
};

export default Index;
