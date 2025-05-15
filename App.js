// Flavia Glenda N°04 e Lucas Randal N°18
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import login from './src/screens/login.js';
import cadastro from './src/screens/cadastro.js';
import listarImg from './src/screens/listarImg.js';
import listarVideo from './src/screens/listarVideo.js';
import uploadImg from './src/screens/uploadImg.js';
import uploadVideo from './src/screens/uploadVideo.js';

const Stack = createNativeStackNavigator();

const App = () => (
  <NavigationContainer>
    -<Stack.Navigator initialRouteName="Login" screenOptions={{headerShown: false}}>
      <Stack.Screen name="login" component={login} />
      <Stack.Screen name="cadastro" component={cadastro} />
      <Stack.Screen name="listarImg" component={listarImg} />
      <Stack.Screen name="listarVideo" component={listarVideo} />
      <Stack.Screen name="uploadImg" component={uploadImg} />
      <Stack.Screen name="uploadVideo" component={uploadVideo} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;
