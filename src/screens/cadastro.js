import React, { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  ImageBackground,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import AwesomeAlert from "react-native-awesome-alerts";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as Notifications from "expo-notifications";
import { supabase } from "../../supabaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function Cadastro() {
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [imageUri, setImageUri] = useState(null);

  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [tituloAlerta, setTituloAlerta] = useState("");
  const [mensagemAlerta, setMensagemAlerta] = useState("");
  const [sucesso, setSucesso] = useState(true);

  const navigation = useNavigation();

  const exibirAlertaPersonalizado = (titulo, mensagem, ehSucesso = true) => {
    setTituloAlerta(titulo);
    setMensagemAlerta(mensagem);
    setSucesso(ehSucesso);
    setMostrarAlerta(true);
  };

  const escolherImagem = async () => {
    let resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.IMAGE], // forma correta
      quality: 1,
    });

    if (!resultado.canceled) {
      const imagem = resultado.assets[0].uri;
      setImagemSelecionada(imagem); // ou a lógica que estiver usando
    }
  };

  const aoRegistrar = async () => {
    if (!nomeCompleto || !email || !senha || !imageUri) {
      exibirAlertaPersonalizado("Erro", "Preencha todos os campos e selecione uma imagem.", false);
      return;
    }

    if (senha.length < 6) {
      exibirAlertaPersonalizado("Erro", "A senha deve ter ao menos 6 caracteres.", false);
      return;
    }

    try {
      await supabase.auth.signOut();

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (signUpError) throw signUpError;

      const id_user = signUpData.user.id;
      const fileName = imageUri.substring(imageUri.lastIndexOf("/") + 1);
      const fileType = "image/jpeg";

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(
          `${id_user}/${fileName}`,
          {
            uri: `data:${fileType};base64,${base64}`,
            name: fileName,
            type: fileType,
          },
          {
            contentType: fileType,
            upsert: true,
          }
        );

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(`${id_user}/${fileName}`);

      const photoURL = publicUrlData.publicUrl;

      const { error: dbError } = await supabase
        .from("users")
        .insert({
          id_user: id_user,
          name_user: nomeCompleto,
          email_user: email,
          photoUrl_user: photoURL,
        });

      if (dbError) throw dbError;

      exibirAlertaPersonalizado("Sucesso", "Conta criada com sucesso!");

      // Notificação local
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Novo usuário cadastrado!",
          body: `${nomeCompleto} foi incluído no banco.`,
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      exibirAlertaPersonalizado("Erro", `Erro ao criar conta: ${error.message}`, false);
    }
  };

  return (
    <View>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <TextInput
          style={styles.campo}
          placeholder="Nome completo"
          placeholderTextColor="#555"
          value={nomeCompleto}
          onChangeText={setNomeCompleto}
        />

        <TextInput
          style={styles.campo}
          placeholder="E-mail"
          placeholderTextColor="#555"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.campo}
          placeholder="Senha"
          placeholderTextColor="#555"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <Pressable style={styles.botaoGoogle} onPress={escolherImagem}>
          <Text style={styles.textoBotaoGoogle}>
            {imageUri ? "Imagem selecionada" : "Selecionar imagem de perfil"}
          </Text>
        </Pressable>

        <Pressable style={styles.botao} onPress={aoRegistrar}>
          <Text style={styles.textoBotao}>Criar conta</Text>
        </Pressable>
      </ScrollView>

      <AwesomeAlert
        show={mostrarAlerta}
        showProgress={false}
        title={tituloAlerta}
        message={mensagemAlerta}
        closeOnTouchOutside
        showConfirmButton
        confirmText="OK"
        confirmButtonColor={sucesso ? "#4BB543" : "#DD6B55"}
        onConfirmPressed={() => {
          setMostrarAlerta(false);
          if (sucesso) {
            setNomeCompleto("");
            setEmail("");
            setSenha("");
            setImageUri(null);
            navigation.navigate("Login");
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 60,
  },
  logo: {
    width: 320,
    height: 320,
    resizeMode: "contain",
    marginBottom: -60,
    marginTop: 70,
  },
  campo: {
    borderColor: "gray",
    borderWidth: 1,
    backgroundColor: "white",
    marginBottom: 20,
    width: 300,
    height: 40,
    paddingLeft: 10,
    borderRadius: 8,
    shadowColor: "#c1c1c1",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.8,
  },
  botao: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginBottom: 30,
    marginTop: 10,
    shadowColor: "#2c2dd7",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.8,
    borderColor: "#2c2dd7",
    borderWidth: 2,
  },
  textoBotao: {
    color: "#2c2dd7",
    fontSize: 16,
    fontWeight: "bold",
  },
  botaoGoogle: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    marginBottom: 20,
  },
  textoBotaoGoogle: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
  },
});
