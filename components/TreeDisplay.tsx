// Updated TreeDisplay.tsx

import { useState, useEffect } from "react";
import { Image, TouchableOpacity } from "react-native";
import * as FileSystem from "expo-file-system";
import useChoose from "@/hooks/useChoose";

interface TreeDisplayProps {
  treeName: string;
  buttonName: string;
  isDeleting: boolean;
  resetKey?: string; // New prop to trigger reset
  pushBeingDelete: (tree: string) => void;
  removeBeingDelete: (tree: string) => void;
  refreshKey: number;
}

export default function TreeDisplay({
  treeName,
  buttonName,
  isDeleting,
  resetKey,
  pushBeingDelete,
  removeBeingDelete,
  refreshKey = 0, // Default value
}: TreeDisplayProps) {
  const [isBeingDeleted, setIsBeingDeleted] = useState(false);
  const handleChoose = useChoose();
  
  // Add effect to reset selected state when resetKey changes
  useEffect(() => {
    // When going back to normal mode, reset the deleted state
    if (resetKey === "normal" && isBeingDeleted) {
      setIsBeingDeleted(false);
      // Also ensure we remove this tree from the parent's selection array
      removeBeingDelete(treeName);
    }
  }, [resetKey, removeBeingDelete, treeName]);

  // Additional check: when isDeleting becomes false, reset selection
  useEffect(() => {
    if (!isDeleting && isBeingDeleted) {
      setIsBeingDeleted(false);
      removeBeingDelete(treeName);
    }
  }, [isDeleting, isBeingDeleted, removeBeingDelete, treeName]);

  const handleSelectDelete = () => {
    setIsBeingDeleted((b) => !b);
    if (!isBeingDeleted) {
      pushBeingDelete(treeName);
    } else {
      removeBeingDelete(treeName);
    }
  };

  // Add cache-busting to image URI
  const imageUri = `${FileSystem.documentDirectory}trees/${treeName}?refresh=${refreshKey}`;

  return (
    <TouchableOpacity
      onPress={() =>
        isDeleting ? handleSelectDelete() : handleChoose(buttonName, treeName)
      }
    >
      <Image
        source={{ uri: imageUri }}
        style={[
          {
            width: 200,
            height: 200,
            borderRadius: 10,
            borderColor: "red",
            borderWidth: isBeingDeleted ? 3 : 0,
            overflow: "hidden",
          },
        ]}
        key={`${treeName}-${refreshKey}`} // Force re-render on refresh
        onError={(e) => console.log("Image load error:", e.nativeEvent.error)}
      />
    </TouchableOpacity>
  );
}