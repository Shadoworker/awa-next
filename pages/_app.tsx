import type { AppProps } from 'next/app'
 
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import '../src/App.css';
import { Provider } from 'react-redux';
import mainStore from '../redux/main/mainStore';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Theme><Provider store={mainStore} > <Component {...pageProps} /></Provider></Theme>
}