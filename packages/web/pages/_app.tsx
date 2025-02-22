import 'assets/custom-markdown-editor.scss';
import 'react-markdown-editor-lite/lib/index.css';

import { Honeybadger, HoneybadgerErrorBoundary } from '@honeybadger-io/react';
import { ChakraProvider, CSSReset, MetaTheme } from '@metafam/ds';
import { Constants } from '@metafam/utils';
import { UserbackProvider } from '@userback/react';
import Animocto from 'assets/animocto.svg';
import { MegaMenu } from 'components/MegaMenu';
import { CONFIG } from 'config';
import { ComposeDBContextProvider } from 'contexts/ComposeDBContext';
import { Web3ContextProvider } from 'contexts/Web3Context';
import { wrapUrqlClient } from 'graphql/client';
import { useMounted } from 'lib/hooks';
import Head from 'next/head';
import Image from 'next/image';
import PlausibleProvider from 'next-plausible';
import { WithUrqlProps } from 'next-urql';
import React from 'react';

const { userbackToken, honeybadgerAPIKey } = CONFIG;

const Analytics: React.FC = () =>
  !CONFIG.gaId ? null : (
    <>
      <script
        async
        defer
        src={`https://www.googletagmanager.com/gtag/js?id=${CONFIG.gaId}`}
      />
      <script
        type="text/javascript"
        async
        defer
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments) }
            gtag('js', new Date());
            gtag('config', '${CONFIG.gaId}');
          `,
        }}
      />
    </>
  );

const App: React.FC<WithUrqlProps> = ({
  pageProps,
  resetUrqlClient,
  Component,
}) => {
  const isMounted = useMounted();
  if (!isMounted) {
    return (
      <div
        style={{
          height: '100vh',
          backgroundColor: '#130032',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image src={Animocto.src} alt="Loading..." height={250} width={250} />
        <style jsx global>{`
          body {
            margin: 0;
            padding: 0;
            font-size: 18px;
            font-weight: 400;
            line-height: 1.8;
            color: #333;
            font-family: sans-serif;
          }
          h1 {
            font-weight: 700;
          }
          p {
            margin-bottom: 10px;
          }
        `}</style>
      </div>
    );
  }
  return (
    <ChakraProvider theme={MetaTheme} resetCSS={true}>
      <CSSReset />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MetaGame</title>
        {CONFIG.appEnv === 'production' && <Analytics />}
      </Head>
      <Web3ContextProvider {...{ resetUrqlClient }}>
        <ComposeDBContextProvider>
          <MegaMenu hide={pageProps.hideTopMenu}>
            <Component {...pageProps} />
          </MegaMenu>
        </ComposeDBContextProvider>
      </Web3ContextProvider>
    </ChakraProvider>
  );
};

const DeployedApp: React.FC<WithUrqlProps> = (props) => {
  const honeybadgerConfig = {
    apiKey: honeybadgerAPIKey,
    environment: CONFIG.appEnv,
    enableUncaught: true,
    reportData: CONFIG.useHoneybadger,
    // TODO include git SHA in github action deployment
    // revision: 'git SHA/project version'
  };
  const honeybadger = Honeybadger.configure(honeybadgerConfig);

  return (
    <PlausibleProvider domain={Constants.PLAUSIBLE_DATA_DOMAIN}>
      <HoneybadgerErrorBoundary {...{ honeybadger }}>
        <>
          {userbackToken && <UserbackProvider token={userbackToken} />}
          <App {...props} />
        </>
      </HoneybadgerErrorBoundary>
    </PlausibleProvider>
  );
};

export default wrapUrqlClient(CONFIG.useHoneybadger ? DeployedApp : App);
