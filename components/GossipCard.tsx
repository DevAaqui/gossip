import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Image,
} from "react-native";
import { toSixtyWords } from "../data/gossipNews";
import type { GossipItem } from "../data/gossipNews";

const THUMB_UP = "👍";
const THUMB_DOWN = "👎";
const SUPPORT = "💜";

export type ReactionType = "like" | "dislike" | "support";

export interface ReactionCounts {
  like: number;
  dislike: number;
  support: number;
  active: ReactionType | null;
}

export interface GossipCardProps {
  item: GossipItem;
  reactions?: ReactionCounts | undefined;
  onReaction: (id: string, type: ReactionType) => void;
}

export default function GossipCard({
  item,
  reactions,
  onReaction,
}: GossipCardProps) {
  const { width, height } = useWindowDimensions();
  const [imageError, setImageError] = useState(false);
  const text = toSixtyWords(item.body);
  const mediaHeight = Math.min(height * 0.35, 280);
  const showImage = item.imageUri && !imageError;

  const likeCount = reactions?.like ?? 0;
  const dislikeCount = reactions?.dislike ?? 0;
  const supportCount = reactions?.support ?? 0;

  return (
    <View style={[styles.card, { minHeight: height * 0.7 }]}>
      <View style={[styles.mediaContainer, { minHeight: mediaHeight }]}>
        {showImage ? (
          <Image
            source={{ uri: item.imageUri }}
            style={[styles.mediaImage, { height: mediaHeight }]}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : item.videoUri ? (
          <View style={[styles.mediaPlaceholder, { height: mediaHeight }]}>
            <Text style={styles.mediaPlaceholderIcon}>▶</Text>
            <Text style={styles.mediaPlaceholderText}>Video</Text>
          </View>
        ) : (
          <View style={[styles.mediaPlaceholder, { height: mediaHeight }]}>
            <Text style={styles.mediaPlaceholderIcon}>🖼</Text>
            <Text style={styles.mediaPlaceholderText}>Image / Video</Text>
          </View>
        )}
      </View>
      {/* <Text style={styles.date}>{item.date}</Text> */}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{text}</Text>

      <View style={styles.reactions}>
        <TouchableOpacity
          style={[
            styles.reactionBtn,
            reactions?.active === "like" && styles.reactionBtnActive,
          ]}
          onPress={() => onReaction(item.id, "like")}
          activeOpacity={0.7}
        >
          <Text style={styles.reactionIcon}>{THUMB_UP}</Text>
          <Text style={styles.reactionCount}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.reactionBtn,
            reactions?.active === "dislike" && styles.reactionBtnActive,
          ]}
          onPress={() => onReaction(item.id, "dislike")}
          activeOpacity={0.7}
        >
          <Text style={styles.reactionIcon}>{THUMB_DOWN}</Text>
          <Text style={styles.reactionCount}>{dislikeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.reactionBtn,
            reactions?.active === "support" && styles.reactionBtnActive,
          ]}
          onPress={() => onReaction(item.id, "support")}
          activeOpacity={0.7}
        >
          <Text style={styles.reactionIcon}>{SUPPORT}</Text>
          <Text style={styles.reactionCount}>{supportCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    padding: 24,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  date: {
    fontSize: 12,
    color: "#a0a0b0",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f0f0f5",
    marginBottom: 16,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    color: "#c0c0d0",
    lineHeight: 24,
    marginBottom: 16,
  },
  mediaContainer: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.2)",
    marginBottom: 8,
  },
  mediaImage: {
    width: "100%",
    borderRadius: 12,
  },
  mediaPlaceholder: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
  },
  mediaPlaceholderIcon: {
    fontSize: 32,
    marginBottom: 8,
    opacity: 0.6,
  },
  mediaPlaceholderText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
  },
  reactions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  reactionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.06)",
    gap: 6,
  },
  reactionBtnActive: {
    backgroundColor: "rgba(162, 155, 254, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(162, 155, 254, 0.5)",
  },
  reactionIcon: {
    fontSize: 20,
  },
  reactionCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e0e0e8",
  },
});
