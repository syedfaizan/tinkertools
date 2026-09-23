import type { ToolMeta } from "@/tools/registry";
import dynamic from "next/dynamic";
import { AudioWaveform } from "lucide-react";

export const VideoToAudio = dynamic(() =>
  import("./index").then((mod) => mod.VideoToAudio)
);

export const videoToAudioMeta: ToolMeta = {
  slug: "video-to-audio",
  title: "Video to Audio",
  description:
    "Extract the audio track from any video — MP4, MOV, WebM, MKV and more — and download it as MP3, M4A or lossless WAV. Runs entirely in your browser.",
  category: "video",
  keywords: [
    "extract audio from video",
    "video to mp3",
    "video to audio converter",
    "mp4 to mp3",
    "audio extractor",
  ],
  icon: AudioWaveform,
  component: VideoToAudio,
};