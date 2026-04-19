import styles from "./auth.module.css";

const stickers = [
  { text: "简历被骂过 100 次的少年", top: "12%", left: "8%", rot: -8, cls: styles.stAcid },
  { text: "面试前必来膜拜一下", top: "22%", right: "10%", rot: 6, cls: styles.stMint },
  { text: "不是玄学，是科学", bottom: "18%", left: "12%", rot: 4, cls: styles.stGrape },
  { text: "本站拒绝温柔语气", bottom: "10%", right: "14%", rot: -6, cls: styles.stSky },
] as const;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.auth}>
      {stickers.map((s, i) => {
        const pos: React.CSSProperties = {
          top: "top" in s ? s.top : undefined,
          bottom: "bottom" in s ? s.bottom : undefined,
          left: "left" in s ? s.left : undefined,
          right: "right" in s ? s.right : undefined,
          transform: `rotate(${s.rot}deg)`,
        };
        return (
          <div key={i} className={`${styles.sticker} ${s.cls}`} style={pos}>
            {s.text}
          </div>
        );
      })}
      {children}
    </div>
  );
}
