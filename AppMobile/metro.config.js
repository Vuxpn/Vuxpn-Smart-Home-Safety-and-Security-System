const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
// config.resolver = {
//     ...config.resolver,
//     alias: {
//         crypto: require.resolve('expo-crypto'),
//     },
//     resolverMainFields: ['react-native', 'browser', 'main'],
// };
module.exports = withNativeWind(config, { input: './app/global.css' });
