import { memo } from "react";
import styles from "../../App.module.css";
import { Loader } from "../Loader/Loader";
import type { LoaderListProps } from "../../types";

const LoaderListComponent = ({ loaders }: LoaderListProps) => {
  if (loaders.length === 0) {
    return null;
  }

  return (
    <div className={styles.loaders}>
      {loaders.map((loader) => (
        <Loader key={loader.id} messages={loader.messages} />
      ))}
    </div>
  );
};

export const LoaderList = memo(LoaderListComponent);
