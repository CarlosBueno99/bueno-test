"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Navbar } from "../../../components/Navbar";

export default function SpotifyCallback() {
  const router = useRouter();
  const exchangeSpotifyCodeForToken = useAction(api.spotifyActions.exchangeSpotifyCodeForToken);
  const saveSpotifyRefreshToken = useMutation(api.websiteSettings.saveSpotifyRefreshToken);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      exchangeSpotifyCodeForToken({ code })
        .then((result) => {
          if (result.success) {
            saveSpotifyRefreshToken({ refreshToken: result.refreshToken })
              .then((saveResult) => {
                if (saveResult.success) {
                  setStatus("success");
                  setTimeout(() => router.push("/admin?spotify=connected"), 1500);
                } else {
                  setStatus("error");
                  setError(saveResult.error);
                }
              })
              .catch((err) => {
                setStatus("error");
                setError(err instanceof Error ? err.message : String(err));
              });
          } else {
            setStatus("error");
            setError(result.error);
          }
        })
        .catch((err) => {
          setStatus("error");
          setError(err instanceof Error ? err.message : String(err));
        });
    } else {
      setStatus("error");
      setError("No code found in URL");
    }
  }, [router, exchangeSpotifyCodeForToken, saveSpotifyRefreshToken]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow w-full max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Spotify Authorization</CardTitle>
          </CardHeader>
          <CardContent>
            {status === "loading" && <p>Connecting to Spotify...</p>}
            {status === "success" && <p>Spotify connected! Redirecting...</p>}
            {status === "error" && (
              <div className="text-red-600">
                <p>Failed to connect to Spotify.</p>
                {error && <p className="text-xs mt-2">{error}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 