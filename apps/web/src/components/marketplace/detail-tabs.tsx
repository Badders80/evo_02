"use client";

import { useState } from "react";
import { PedigreeTable } from "./pedigree-table";
import { getCampaignStatus, type CampaignStatus } from "@/lib/campaign-status";
import { computeRaceSummary } from "@/lib/race-summary";
import { normalizePedigreeName } from "@/lib/pedigree-name";
import type { RaceLogEntry } from "@evo/db_models";

interface PersonProfile {
  slug: string;
  name: string;
  roles?: string[];
  bio?: string;
  website?: string;
}

interface TrainerShape {
  name: string;
  stable_name: string;
  contact_name?: string;
  location: string;
  nztr_license_number?: string;
  bio?: string;
  website?: string;
  phone?: string;
  email?: string;
  image_path?: string;
  people?: PersonProfile[];
}

interface DetailTabsProps {
  horseName: string;
  sireName: string;
  damName: string;
  damSireName?: string;
  sex: string;
  colour: string;
  age?: number;
  loveracingId?: number;
  breedingUrl?: string | null;
  performanceProfileUrl?: string | null;
  trainer: TrainerShape;
  horseSlug: string;
  listingStatus?: string;
  sharesTotal?: number;
  sharesSold?: number;
  foalingDate?: string;
  pedigreeData?: {
    sire_line?: { name?: string; country?: string; year?: string; partner?: { name?: string; country?: string; year?: string } }[];
    dam_line?: { name?: string; country?: string; year?: string; partner?: { name?: string; country?: string; year?: string } }[];
    cross_line?: { sire_dam_sire?: string; sire_dam_dam?: string; dam_sire_sire?: string; dam_sire_dam?: string };
  } | null;
  story?: string;
  pedigreeBlurb?: string;
  trainerCommentary?: string;
  raceLog?: RaceLogEntry[];
  trainerBio?: string;
  documentsPanel?: React.ReactNode;
}

function getRaceRecordEmptyMessage(status: CampaignStatus): string {
  if (status === "completed") {
    return "No recent starts recorded in our timeline. View the Full NZTR Record for complete race history.";
  }
  if (status === "fully_subscribed") {
    return "No recent starts recorded yet. Horse may be in early campaign or pre-race preparation.";
  }
  return "No recent starts recorded. Horse is currently in pre-training preparation.";
}

function FormattedText({ text }: { text?: string }) {
  if (!text) return null;
  const paragraphs = text.split("\\n\\n").filter(Boolean);
  return (
    <>
      {paragraphs.map((para, idx) => (
        <p key={`para-${idx}-${para.slice(0, 8)}`} className="mb-4 last:mb-0">
          {para}
        </p>
      ))}
    </>
  );
}

export function DetailTabs({
  horseName,
  sireName,
  damName,
  damSireName,
  sex,
  colour,
  age,
  loveracingId,
  breedingUrl,
  performanceProfileUrl,
  trainer,
  foalingDate,
  pedigreeData,
  story,
  pedigreeBlurb,
  raceLog,
  trainerBio,
  documentsPanel,
}: DetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "pedigree" | "trainer" | "race-record" | "documents">("overview");

  const normalizedSireName = normalizePedigreeName(sireName || "");
  const normalizedDamName = normalizePedigreeName(damName || "");
  const status = getCampaignStatus({ listing_status: "listed" } as any);
  const races = raceLog ?? [];
  const summary = computeRaceSummary(races);

  return (
    <div className="border-t border-border pt-12">
      <div className="flex overflow-x-auto border-b border-border scrollbar-none">
        {[
          { key: "overview", label: "Overview" },
          { key: "pedigree", label: "Pedigree" },
          { key: "trainer", label: "Trainer" },
          { key: "race-record", label: "Race Record" },
          { key: "documents", label: "Documents" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`cursor-pointer whitespace-nowrap border-b-2 px-6 py-4 text-xs font-light uppercase tracking-widest transition-all -mb-[2px] ${
              activeTab === tab.key
                ? "border-accent font-medium text-accent"
                : "border-transparent text-muted-foreground hover:text-frost"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[220px] pt-2">
        {activeTab === "overview" && (
          <div className="animate-fade-in space-y-6">
            <div className="border-b border-border pb-4">
              <h4 className="text-md font-medium text-heading">About {horseName}</h4>
              {pedigreeBlurb && (
                <p className="mt-1 text-xs text-muted-foreground">{pedigreeBlurb}</p>
              )}
            </div>
            <div className="prose prose-invert max-w-none text-sm font-light leading-relaxed text-foreground">
              <FormattedText text={story} />
            </div>
          </div>
        )}

        {activeTab === "trainer" && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h4 className="text-md font-medium text-heading">
                  {trainer.stable_name || trainer.name || "—"}
                </h4>
                {trainer.location && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{trainer.location}</p>
                )}
              </div>
              {trainer.website && (
                <a
                  href={trainer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 font-mono text-xs uppercase tracking-widest text-accent hover:underline"
                >
                  Official Website ↗
                </a>
              )}
            </div>
            <div className="prose prose-invert max-w-none text-sm font-light leading-relaxed text-foreground">
              <FormattedText text={trainerBio || trainer.bio} />
            </div>
          </div>
        )}

        {activeTab === "pedigree" && (
          <div className="relative min-h-[280px] space-y-4">
            <PedigreeTable
              horseName={horseName}
              sireName={normalizedSireName}
              damName={normalizedDamName}
              damSireName={damSireName}
              sex={sex}
              colour={colour}
              age={age}
              foalingDate={foalingDate}
              breedingUrl={breedingUrl}
              pedigreeData={pedigreeData}
            />
            {pedigreeBlurb && (
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm font-light leading-relaxed text-zinc-300">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-amber-400">
                  Pedigree Insight
                </span>
                {pedigreeBlurb}
              </div>
            )}
          </div>
        )}

        {activeTab === "race-record" && (
          <div className="animate-fade-in min-h-[280px] space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h4 className="text-md font-medium text-heading">Race Timeline & Starts</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Summary: {summary.wins} Win{summary.wins !== 1 ? "s" : ""} · {" "}
                  {summary.places} Place{summary.places !== 1 ? "s" : ""}
                </p>
              </div>
              {(breedingUrl || performanceProfileUrl) && (
                <div className="flex gap-4">
                  {breedingUrl && (
                    <a
                      href={breedingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs uppercase tracking-widest text-accent hover:underline"
                    >
                      Breeding Record ↗
                    </a>
                  )}
                </div>
              )}
            </div>
            {races.length === 0 ? (
              <p className="py-4 text-sm font-light text-muted-foreground">{getRaceRecordEmptyMessage(status)}</p>
            ) : (
              <div className="space-y-4 pt-2">
                {races.map((race, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-border pb-3 text-sm font-light">
                    <div className="space-y-1">
                      <p className="text-foreground">
                        {race.venue} · <span className="text-xs text-muted-foreground">{race.date}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {race.race} {race.trackCondition ? `(${race.trackCondition})` : ""}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        String(race.result).toLowerCase() === "1st"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : "border-border bg-surface-base text-foreground"
                      }`}
                    >
                      {race.result}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-6">
            <h4 className="text-md font-medium text-heading">Legal Disclosures & Documents</h4>
            <p className="text-xs font-light leading-relaxed text-muted-foreground">
              Ownership is bound by regulated legal documentation. Review the DSL parameters before committing stakes.
            </p>
            {documentsPanel}
          </div>
        )}
      </div>
    </div>
  );
}
