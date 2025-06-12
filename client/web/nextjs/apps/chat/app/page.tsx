import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ThemeImage
          className={styles.logo}
          srcLight="turborepo-dark.svg"
          srcDark="turborepo-light.svg"
          alt="Chat Application logo"
          width={180}
          height={38}
          priority
        />

        <h1>Chat Application</h1>
        <p>Next.js Frontend with NestJS Backend Microservices</p>

        <div className={styles.status}>
          <h2>🐳 Docker Development Environment</h2>
          <ul>
            <li>✅ Next.js Chat Frontend (Port 5100)</li>
            <li>✅ Apollo Federation Gateway (Port 4000)</li>
            <li>✅ WebSocket Gateway (Port 4001)</li>
            <li>✅ Authentication Service (Port 4002)</li>
            <li>✅ User Service (Port 4003)</li>
            <li>✅ Chat Service (Port 4004)</li>
            <li>✅ Notification Service (Port 4005)</li>
          </ul>
        </div>

        <div className={styles.links}>
          <h2>🔗 Quick Links</h2>
          <ul>
            <li><a href="/api/health" target="_blank">Frontend Health Check</a></li>
            <li><a href="http://localhost:4000/graphql" target="_blank">GraphQL Playground</a></li>
            <li><a href="http://localhost:3001" target="_blank">Grafana Dashboard</a></li>
            <li><a href="http://localhost:5101" target="_blank">Documentation</a></li>
          </ul>
        </div>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="/chat"
            rel="noopener noreferrer"
          >
            🚀 Start Chatting
          </a>
          <a
            href="http://localhost:4000/graphql"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            🔍 Explore GraphQL
          </a>
        </div>

        <div className={styles.development}>
          <h2>🛠️ Development Info</h2>
          <p>Environment: {process.env.NODE_ENV}</p>
          <p>GraphQL Endpoint: {process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}</p>
          <p>WebSocket Endpoint: {process.env.NEXT_PUBLIC_WEBSOCKET_ENDPOINT}</p>
        </div>
        <Button appName="web" className={styles.secondary}>
          Open alert
        </Button>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://vercel.com/templates?search=turborepo&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://turborepo.com?utm_source=create-turbo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to turborepo.com →
        </a>
      </footer>
    </div>
  );
}
