import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Image,
  ImageResizeMode,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as FileSystem from "expo-file-system";

interface pot {
  potName: string;
  layoutData: Record<string, string>,
  // style: Object,
}

export default function TreePot({ potName, layoutData }: pot) {
  const hasPotTree = layoutData && "pot" in layoutData && layoutData["pot"];
  const resized = useRef<number>(0);
  const [resizeFix, setResizeFix] = useState<ImageResizeMode>("contain");

  function onResizeFixLoad() {
    if (resized.current == 2) {
      resized.current = 0;
      return;
    }

    setResizeFix((prev) => (prev === "contain" ? "center" : "contain"));
    resized.current++;
  }
  return (
    <TouchableOpacity
      // style={hasPotTree ? styles.treeContainer : styles.potContainer}
      // style = {style}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/garden/inventory",
          params: { name: potName },
        })
      }
    >
      {hasPotTree ? (
        <Image
          source={{
            uri: FileSystem.documentDirectory + "trees/" + layoutData[potName],
          }}
          style={styles.tree}
          resizeMode={resizeFix}
          onLoad={onResizeFixLoad}
        />
      ) : (
        <Image source={require("@/assets/images/pot.png")} style={styles.pot} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pot: {
    width: 50,
    height: 50,
  },
  tree: {
    width: 300,
    height: 400,
  },
});