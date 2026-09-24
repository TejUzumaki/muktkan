"use client";

import { TvExperience } from "./app-shell";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Radio,
  Play,
  Tv2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move3d,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useShelf } from "@/lib/use-shelf";
import { useOnboarding } from "@/lib/store";
import { useViewer } from "@/lib/viewer-store";
import type { TvChannel } from "@/lib/types";

function ChannelLogo({
  channel,
  size = "normal",
}: {
  channel: TvChannel;
  size?: "normal" | "large" | "universe";
}) {
  const initial =
    channel.title
      .replace(/^The\s+|^A\s+|^An\s+/i, "")
      .trim()
      .charAt(0)
      .toUpperCase() || "T";

  return (
    <div
      className={[
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full",
        "border border-white/10 bg-white/[0.045]",
        "shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
        size === "large"
          ? "h-24 w-24 sm:h-28 sm:w-28"
          : size === "universe"
            ? "h-8 w-8 sm:h-10 sm:w-10"
            : "h-16 w-16 sm:h-20 sm:w-20",
      ].join(" ")}
    >
      {channel.logo ? (
        <img
          src={channel.logo}
          alt=""
          draggable={false}
          loading="lazy"
          className="h-full w-full object-contain p-3"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span className="text-xl font-semibold text-white/70">{initial}</span>
      )}

      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
    </div>
  );
}

function LastWatchedCard({
  channel,
  onOpen,
}: {
  channel: TvChannel;
  onOpen: (channel: TvChannel) => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onOpen(channel)}
      className="group relative w-[78vw] max-w-[340px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] text-left transition-colors hover:border-[var(--brand)]/40 hover:bg-white/[0.055]"
    >
      <div className="relative aspect-[16/8] overflow-hidden bg-black">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-contain p-8 opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <ChannelLogo channel={channel} size="large" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {channel.title}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-white/55">
              {channel.group || channel.country || "Live channel"}
            </p>
          </div>

          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-[var(--brand-foreground)] opacity-80 transition group-hover:opacity-100">
            <Play className="h-3.5 w-3.5 fill-current" />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

interface UniversePoint {
  channel: TvChannel;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

const MAX_UNIVERSE_CHANNELS = 120;
const GALAXY_RADIUS = 10;

function buildUniversePoints(channels: TvChannel[]): UniversePoint[] {
  const visible = channels.slice(0, MAX_UNIVERSE_CHANNELS);

  if (visible.length === 0) return [];

  /*
   * This follows the same core spatial idea as the supplied demo:
   *
   *   golden ratio
   *        ↓
   * Fibonacci distribution
   *        ↓
   * 3D spherical coordinates
   *
   * The important difference is that this is a TV-channel universe,
   * not a card gallery. Each channel gets a slightly different radial
   * layer, producing the loose "floating through space" arrangement
   * rather than a single visible shell.
   */
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const goldenAngle = (2 * Math.PI) / goldenRatio;

  return visible.map((channel, index) => {
    const count = visible.length;

    /*
     * Evenly distribute points over a sphere using the Fibonacci
     * construction. This avoids latitude bands and obvious rows.
     */
    const y = 1 - (index / Math.max(1, count - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * index;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    /*
     * Multiple radial layers are intentional.
     *
     * The demo uses:
     *   12 + (i % 3) * 4
     *
     * We retain that principle but make the field considerably larger
     * and more suitable for small TV logos.
     */
    const layer =
      GALAXY_RADIUS +
      (index % 5) * 1.8 +
      Math.sin(index * 1.73) * 1.15;

    /*
     * Small deterministic irregularity prevents the arrangement from
     * looking like a perfectly manufactured shell while preserving the
     * mathematical Fibonacci distribution as the underlying structure.
     */
    const radialJitter =
      1 +
      Math.sin(index * 2.417) * 0.045 +
      Math.cos(index * 0.731) * 0.025;

    const finalRadius = layer * radialJitter;

    const px = x * finalRadius;
    const py =
      y * finalRadius +
      Math.sin(index * 1.19) * 0.32;
    const pz = z * finalRadius;

    const rotation: [number, number, number] = [
      Math.atan2(z, Math.sqrt(x * x + y * y)),
      Math.atan2(x, z),
      Math.sin(index * 0.91) * 0.12,
    ];

    /*
     * The demo uses large cards. Our channel marks are intentionally
     * much smaller — approximately 50% of the previous NO-DISH size —
     * because the larger spatial field gives them breathing room.
     */
    const scale =
      0.82 +
      ((Math.sin(index * 1.43) + 1) / 2) * 0.18;

    return {
      channel,
      position: [px, py, pz],
      rotation,
      scale,
    };
  });
}

function UniverseStars() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const { positions, sizes } = useMemo(() => {
    const count = 2200;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    /*
     * Deterministic pseudo-random generator.
     * This keeps the starfield stable between React renders.
     */
    let seed = 91357;

    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let index = 0; index < count; index += 1) {
      /*
       * A very large volume rather than a flat backdrop.
       */
      const radius = 35 + random() * 45;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);

      positions[index * 3] =
        radius * Math.sin(phi) * Math.cos(theta);

      positions[index * 3 + 1] =
        radius * Math.cos(phi);

      positions[index * 3 + 2] =
        radius * Math.sin(phi) * Math.sin(theta);

      sizes[index] =
        0.55 +
        random() * 1.55;
    }

    return { positions, sizes };
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y =
        clock.elapsedTime * 0.004;

      pointsRef.current.rotation.x =
        Math.sin(clock.elapsedTime * 0.035) * 0.018;
    }

    if (materialRef.current) {
      /*
       * Gentle global breathing gives the impression of tiny distant
       * points sparkling without turning the field into a flashy effect.
       */
      materialRef.current.opacity =
        0.52 +
        Math.sin(clock.elapsedTime * 0.75) * 0.08;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>

      <pointsMaterial
        ref={materialRef}
        color="#ffffff"
        size={0.085}
        sizeAttenuation
        transparent
        opacity={0.58}
        depthWrite={false}
      />
    </points>
  );
}

function UniverseNode({
  point,
  selected,
  onSelect,
}: {
  point: UniversePoint;
  selected: boolean;
  onSelect: (channel: TvChannel) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={point.position}
      rotation={point.rotation}
      scale={point.scale}
    >
      <Html
        center
        transform
        sprite
        distanceFactor={14}
        zIndexRange={[10, 0]}
        style={{
          pointerEvents: "auto",
          userSelect: "none",
        }}
      >
        <button
          type="button"
          aria-label={`Watch ${point.channel.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(point.channel);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          className="group relative cursor-pointer rounded-full outline-none"
        >
          <div
            className={[
              "rounded-full transition-all duration-200",
              selected
                ? "scale-110 shadow-[0_0_0_1.5px_var(--brand),0_0_24px_color-mix(in_srgb,var(--brand)_48%,transparent)]"
                : hovered
                  ? "scale-110 shadow-[0_0_0_1px_var(--brand),0_0_20px_color-mix(in_srgb,var(--brand)_34%,transparent)]"
                  : "",
            ].join(" ")}
          >
            <ChannelLogo
              channel={point.channel}
              size="universe"
            />
          </div>

          <span
            className={[
              "pointer-events-none absolute left-1/2 top-[calc(100%+6px)] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/75 px-2 py-0.5 text-[8px] font-medium text-white backdrop-blur-md transition-opacity",
              selected || hovered
                ? "opacity-100"
                : "opacity-0",
            ].join(" ")}
          >
            {point.channel.title}
          </span>
        </button>
      </Html>
    </group>
  );
}

function UniverseScene({
  points,
  selectedId,
  onSelect,
  onInteraction,
  controlsRef,
}: {
  points: UniversePoint[];
  selectedId: string | null;
  onSelect: (channel: TvChannel) => void;
  onInteraction: () => void;
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
}) {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 0, 18]}
        fov={52}
        near={0.1}
        far={150}
      />

      <ambientLight intensity={0.28} />

      <UniverseStars />

      {points.map((point) => (
        <UniverseNode
          key={point.channel.id}
          point={point}
          selected={selectedId === point.channel.id}
          onSelect={onSelect}
        />
      ))}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.065}
        enablePan
        enableZoom
        enableRotate
        minDistance={7}
        maxDistance={48}
        rotateSpeed={0.5}
        zoomSpeed={1.05}
        panSpeed={0.7}
        autoRotate={false}
        onStart={onInteraction}
        onChange={onInteraction}
      />
    </>
  );
}

function ChannelSearch({
  channels,
  onOpen,
  onClose,
}: {
  channels: TvChannel[];
  onOpen: (channel: TvChannel) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const tags = useMemo(() => {
    const values = new Set<string>();

    for (const channel of channels) {
      const group = channel.group?.trim();
      const country = channel.country?.trim();

      if (group) values.add(group);
      if (country) values.add(country);
    }

    const preferred = [
      "Maharashtra",
      "India",
      "News",
      "Sports",
      "Entertainment",
      "Music",
      "Kids",
      "Movies",
    ];

    const preferredMatches = preferred.filter((tag) =>
      Array.from(values).some(
        (value) => value.toLowerCase() === tag.toLowerCase()
      )
    );

    const remaining = Array.from(values)
      .filter(
        (value) =>
          !preferredMatches.some(
            (tag) => tag.toLowerCase() === value.toLowerCase()
          )
      )
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 12);

    return ["All", ...preferredMatches, ...remaining];
  }, [channels]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return channels.filter((channel) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          channel.title,
          channel.group,
          channel.country,
        ]
          .filter(Boolean)
          .some((value) =>
            value!.toLowerCase().includes(normalizedQuery)
          );

      const matchesTag =
        activeTag === "All" ||
        [channel.group, channel.country, channel.title]
          .filter(Boolean)
          .some(
            (value) =>
              value!.toLowerCase() === activeTag.toLowerCase() ||
              value!.toLowerCase().includes(activeTag.toLowerCase())
          );

      return matchesQuery && matchesTag;
    });
  }, [activeTag, channels, query]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025]"
    >
      <div className="border-b border-white/[0.07] px-4 py-5 sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--brand)]">
              <Search className="h-3.5 w-3.5" />
              Channel search
            </div>

            <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
              Find a channel.
            </h2>

            <p className="mt-1 text-xs leading-5 text-white/40">
              Search the catalogue or browse by category.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.035] text-white/45 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Close channel search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search channels, regions, categories…"
            className="h-12 w-full rounded-xl border border-white/10 bg-black/40 pl-11 pr-11 text-sm text-white outline-none placeholder:text-white/25 focus:border-[var(--brand)]/40"
            aria-label="Search live TV channels"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-white/30 transition hover:bg-white/10 hover:text-white"
              aria-label="Clear channel search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {tags.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tags.map((tag) => {
              const active = activeTag === tag;

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={[
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-[10px] font-medium transition",
                    active
                      ? "border-[var(--brand)]/45 bg-[var(--brand)]/10 text-[var(--brand)]"
                      : "border-white/10 bg-white/[0.025] text-white/40 hover:border-white/20 hover:text-white/70",
                  ].join(" ")}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-4 py-6 sm:px-7 sm:py-7">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">
            {results.length} {results.length === 1 ? "channel" : "channels"}
          </p>

          {activeTag !== "All" && (
            <button
              type="button"
              onClick={() => setActiveTag("All")}
              className="text-[10px] text-white/35 transition hover:text-white"
            >
              Clear filter
            </button>
          )}
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((channel) => (
              <motion.button
                key={channel.id}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onOpen(channel)}
                className="group flex min-w-0 flex-col items-center text-center"
              >
                <div className="relative">
                  <ChannelLogo channel={channel} size="large" />

                  <span className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full border border-black/50 bg-[var(--brand)] text-[var(--brand-foreground)] shadow-[0_0_18px_color-mix(in_srgb,var(--brand)_35%,transparent)]">
                    <Play className="h-3 w-3 fill-current" />
                  </span>
                </div>

                <p className="mt-3 w-full truncate px-1 text-xs font-semibold text-white/75 transition group-hover:text-white">
                  {channel.title}
                </p>

                <p className="mt-1 w-full truncate px-1 text-[10px] text-white/30">
                  {channel.group || channel.country || "Live channel"}
                </p>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="grid min-h-[260px] place-items-center rounded-2xl border border-white/[0.07] bg-black/20 px-6 text-center">
            <div>
              <Search className="mx-auto h-7 w-7 text-white/20" />

              <p className="mt-4 text-sm font-medium text-white/55">
                No matching channels
              </p>

              <p className="mt-1 text-xs text-white/30">
                Try another channel name, region, or category.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}

function ChannelUniverse({
  channels,
  onOpen,
}: {
  channels: TvChannel[];
  onOpen: (channel: TvChannel) => void;
}) {
  const [activeTag, setActiveTag] = useState("All");

  const universeTags = useMemo(() => {
    const values = new Set<string>();

    for (const channel of channels) {
      const group = channel.group?.trim();
      const country = channel.country?.trim();

      if (group) values.add(group);
      if (country) values.add(country);
    }

    const preferred = [
      "Maharashtra",
      "India",
      "News",
      "Sports",
      "Entertainment",
      "Music",
      "Kids",
      "Movies",
    ];

    const preferredMatches = preferred.filter((tag) =>
      Array.from(values).some(
        (value) => value.toLowerCase() === tag.toLowerCase()
      )
    );

    const remaining = Array.from(values)
      .filter(
        (value) =>
          !preferredMatches.some(
            (tag) => tag.toLowerCase() === value.toLowerCase()
          )
      )
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 12);

    return ["All", ...preferredMatches, ...remaining];
  }, [channels]);

  const filteredChannels = useMemo(() => {
    if (activeTag === "All") {
      return channels;
    }

    const normalizedTag = activeTag.toLowerCase();

    return channels.filter((channel) =>
      [channel.group, channel.country, channel.title]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(normalizedTag)
        )
    );
  }, [activeTag, channels]);

  const points = useMemo(
    () => buildUniversePoints(filteredChannels),
    [filteredChannels]
  );

  const controlsRef =
    useRef<OrbitControlsImpl | null>(null);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [isInteracting, setIsInteracting] =
    useState(false);

  const [resetVersion, setResetVersion] =
    useState(0);

  const idleTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetView = useCallback(() => {
    setActiveTag("All");
    setSelectedId(null);
    setIsInteracting(false);

    controlsRef.current?.reset();

    setResetVersion((value) => value + 1);
  }, []);

  const armIdleReset = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      resetView();
    }, 5 * 60 * 1000);
  }, [resetView]);

  useEffect(() => {
    armIdleReset();

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [armIdleReset]);

  const registerInteraction = useCallback(() => {
    setIsInteracting(true);
    armIdleReset();
  }, [armIdleReset]);

  const handleSelect = useCallback(
    (channel: TvChannel) => {
      registerInteraction();
      setSelectedId(channel.id);
      onOpen(channel);
    },
    [onOpen, registerInteraction]
  );

  const zoomIn = () => {
    registerInteraction();
    controlsRef.current?.dollyIn(1.18);
    controlsRef.current?.update();
  };

  const zoomOut = () => {
    registerInteraction();
    controlsRef.current?.dollyOut(1.18);
    controlsRef.current?.update();
  };

  return (
    <section className="relative mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-[#030406]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--brand)_7%,transparent),transparent_64%)] blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <div className="relative px-4 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
              <Move3d className="h-3.5 w-3.5" />
              Channel Universe
            </div>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Explore the live field.
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
              Move through a living 3D field of channels. Drag,
              zoom, pan, and select any signal to watch. Use the categories
              to reshape the field around a specific type of channel.
            </p>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
              Catalogue
            </p>

            <p className="mt-1 text-sm font-medium text-white/55">
              {filteredChannels.length} channels
            </p>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between gap-3 sm:hidden">
          <span className="text-[11px] text-white/30">
            {filteredChannels.length} channels
          </span>

          <div className="flex items-center gap-1.5 text-[10px] text-white/30">
            <Move3d className="h-3 w-3" />
            Drag · Pinch · Zoom
          </div>
        </div>

        <div className="mb-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2">
            {universeTags.map((tag) => {
              const active = activeTag === tag;

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setActiveTag(tag);
                    setSelectedId(null);
                  }}
                  className={[
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-[10px] font-medium transition",
                    active
                      ? "border-[var(--brand)]/45 bg-[var(--brand)]/10 text-[var(--brand)]"
                      : "border-white/10 bg-white/[0.025] text-white/40 hover:border-white/20 hover:text-white/70",
                  ].join(" ")}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative h-[min(82vw,720px)] min-h-[400px] overflow-hidden rounded-[1.8rem] touch-none select-none">
          <div className="absolute inset-0">
            <Canvas
              dpr={[1, 1.5]}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
              }}
              camera={{
                position: [0, 0, 18],
                fov: 52,
                near: 0.1,
                far: 150,
              }}
              onCreated={({ gl }) => {
                gl.setClearColor(0x000000, 0);
              }}
            >
              <UniverseScene
                key={resetVersion}
                points={points}
                selectedId={selectedId}
                onSelect={handleSelect}
                onInteraction={registerInteraction}
                controlsRef={controlsRef}
              />
            </Canvas>
          </div>

          <div className="pointer-events-none absolute inset-0 z-[11] bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.18)_72%,rgba(0,0,0,0.55)_100%)]" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[11] h-24 bg-gradient-to-t from-[#030406] to-transparent" />

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/65 p-1.5 backdrop-blur-xl">
            <button
              type="button"
              onClick={zoomOut}
              className="grid h-9 w-9 place-items-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={resetView}
              className="grid h-9 w-9 place-items-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white"
              aria-label="Reset channel universe view"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={zoomIn}
              className="grid h-9 w-9 place-items-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          <div className="pointer-events-none absolute right-4 top-4 z-20 hidden rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-white/30 backdrop-blur sm:block">
            {points.length} in field
          </div>

          {isInteracting && (
            <div className="pointer-events-none absolute left-4 top-4 z-20 hidden rounded-full border border-[var(--brand)]/[0.12] bg-black/35 px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-[var(--brand)]/45 backdrop-blur sm:block">
              Spatial view
            </div>
          )}
        </div>

        {filteredChannels.length > points.length && (
          <p className="mt-5 text-center text-[11px] text-white/25">
            {points.length} channels are currently rendered in
            the spatial field. The remaining{" "}
            {filteredChannels.length - points.length} remain in the
            selected catalogue space.
          </p>
        )}

        {filteredChannels.length === 0 && (
          <p className="mt-5 text-center text-[11px] text-white/25">
            No channels match this category.
          </p>
        )}
      </div>
    </section>
  );
}

export function LiveTvPage() {
  const router = useRouter();
  const tvShelf = useShelf("tv", "all", 500);
  const recentlyViewed = useOnboarding((state) => state.recentlyViewed);
  const openTv = useViewer((state) => state.openTv);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const channels = useMemo(
    () =>
      tvShelf.items.filter(
        (item): item is TvChannel => item.kind === "tv"
      ),
    [tvShelf.items]
  );

  const lastWatched = useMemo(
    () =>
      recentlyViewed.filter(
        (item): item is TvChannel => item.kind === "tv"
      ),
    [recentlyViewed]
  );

  const openChannel = (channel: TvChannel) => {
    openTv(channel);
  };

  return (
    <>
      <TvExperience />

      <main className="min-h-screen bg-[#050506] text-white">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,255,107,0.055),transparent_38%)]" />

        <div className="relative mx-auto w-full max-w-[1600px] px-4 pb-20 pt-4 sm:px-6 lg:px-10">
          <header className="sticky top-0 z-30 -mx-4 mb-10 border-b border-white/[0.07] bg-[#050506]/88 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="group flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-white"
                aria-label="Back to NO-DISH home"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span>NO-DISH</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen((value) => !value)}
                  className={[
                    "flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] transition",
                    isSearchOpen
                      ? "border-[var(--brand)]/40 bg-[var(--brand)]/10 text-[var(--brand)]"
                      : "border-white/10 bg-white/[0.025] text-white/45 hover:border-white/20 hover:bg-white/[0.05] hover:text-white",
                  ].join(" ")}
                  aria-label={
                    isSearchOpen
                      ? "Close channel search"
                      : "Search live TV channels"
                  }
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Search</span>
                </button>

                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)] shadow-[0_0_12px_var(--brand)]" />
                  Live
                </div>
              </div>
            </div>
          </header>

          <section className="pt-2 sm:pt-6">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/35">
                <Tv2 className="h-3.5 w-3.5" />
                NO-DISH Television
              </div>

              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
                Live TV,
                <span className="block text-white/35">without the grid.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
                A dedicated live channel space built around exploration rather
                than a conventional television guide.
              </p>
            </div>
          </section>

          {isSearchOpen && channels.length > 0 && (
            <ChannelSearch
              channels={channels}
              onOpen={openChannel}
              onClose={() => setIsSearchOpen(false)}
            />
          )}

          {lastWatched.length > 0 && (
            <section className="mt-12">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--brand)]">
                    Resume
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-white">
                    Last watched
                  </h2>
                </div>

                <span className="text-[11px] text-white/30">
                  {lastWatched.length} recent
                </span>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {lastWatched.slice(0, 8).map((channel) => (
                  <LastWatchedCard
                    key={channel.id}
                    channel={channel}
                    onOpen={openChannel}
                  />
                ))}
              </div>
            </section>
          )}

          {tvShelf.loading && channels.length === 0 ? (
            <section className="mt-12 grid min-h-[420px] place-items-center rounded-[2rem] border border-white/10 bg-white/[0.02]">
              <div className="text-center">
                <Radio className="mx-auto h-7 w-7 animate-pulse text-[var(--brand)]" />

                <p className="mt-4 text-sm text-white/60">
                  Tuning the channel universe…
                </p>
              </div>
            </section>
          ) : channels.length > 0 ? (
            <ChannelUniverse
              channels={channels}
              onOpen={openChannel}
            />
          ) : (
            <section className="mt-12 grid min-h-[420px] place-items-center rounded-[2rem] border border-white/10 bg-white/[0.02] px-6 text-center">
              <div>
                <Radio className="mx-auto h-8 w-8 text-white/25" />

                <h2 className="mt-4 text-lg font-semibold text-white">
                  No live channels available
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-white/45">
                  The IPTV catalogue could not be loaded right now. Try again
                  later.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
