import { useState } from "react";
import { Image, TouchableOpacity } from "react-native";
import * as FileSystem from "expo-file-system";
import useChoose from "@/hooks/useChoose";


interface TreeDisplayProps {
  buttonName: string;
  treeName: string;
  isDeleting: boolean;
  pushBeingDelete : (newTree : string) => void;
  removeBeingDelete : (newTree : string) => void;
}
export default function TreeDisplay({treeName, buttonName, isDeleting, pushBeingDelete, removeBeingDelete} : TreeDisplayProps) {
    const [isBeingDeleted, setIsBeingDeleted] = useState(false);
    const handleChoose = useChoose();

    const handleSelectDelete = () => {
      setIsBeingDeleted(b => !b);
      if (!isBeingDeleted)
      {
        pushBeingDelete(treeName);
      } else {
        removeBeingDelete(treeName);
      }
    }

    return (
      <TouchableOpacity onPress={() => isDeleting ? handleSelectDelete() : handleChoose(buttonName, treeName)}>
        <Image
          source = {{uri : FileSystem.documentDirectory+"trees/"+treeName}}
          style = {[{ width: 300, height: 300}, isBeingDeleted ? {borderWidth : 3} : {borderWidth : 0}]}
        />
      </TouchableOpacity>
    )
  }