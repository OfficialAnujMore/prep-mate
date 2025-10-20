import styles from "./Footer.module.css";

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        Made with{" "}
        <span role="img" aria-label="love" className={styles.heart}>
          ❤️
        </span>{" "}
        by{" "}
        <a
          className={styles.link}
          href="https://anuj-more.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Anuj More
        </a>
      </p>
       <p className={styles.text}>
        v1.0.0 @{currentYear}
      </p>
    </footer>
  );
}

export default Footer;
