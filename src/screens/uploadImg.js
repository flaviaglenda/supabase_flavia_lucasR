// Flávia Glenda N°04 e Lucas Randal N°18
import { supabase } from "../../supabaseConfig";
import React, { useState } from "react";
import { Pressable, Image, View, Text, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const UploadFoto = ({ navigation }) => {
  const [imageUri, setImageUri] = useState(null);

  const EscolherImagem = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Permita o acesso à galeria para trocar a foto."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        const selectedUri = result.assets[0].uri;
        setImageUri(selectedUri);
        await uploadImage(selectedUri);
      }
    } catch (error) {
      console.log("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  };

  const uploadImage = async (uri) => {
    if (!uri) {
      Alert.alert("Erro", "Nenhuma imagem selecionada.");
      return;
    }

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      const user = authData?.user;

      if (authError || !user) {
        Alert.alert("Erro", "Usuario nao autenticado.");
        return;
      }

      const timestamp = new Date().getTime();
      let fileExt = uri.split(".").pop().toLowerCase();
      if (!fileExt || fileExt.length > 4) fileExt = "jpg";

      const validExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      if (!validExtensions.includes(fileExt)) fileExt = "jpg";

      const filename = `${user.id}+${timestamp}.${fileExt}`;
      const filePath = `galeria/${user.id}/${filename}`;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileBuffer = Uint8Array.from(atob(base64), (c) =>
         c.charCodeAt(0));

      const { error: uploadError } = await supabase.storage
        .from("imagens")
        .upload(filePath, fileBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("imagens")
        .getPublicUrl(filePath);

      const finalUrl = `${urlData.publicUrl}?t=${timestamp}`;

      Alert.alert("Sucesso!", "Imagem enviada com sucesso");
      console.log("URL pública da imagem: ", finalUrl);
      navigation.goBack();
    } catch (error) {
      console.log("Erro ao fazer o upload da imagem", error);
      Alert.alert("Erro", error.message || "Falha ao enviar a imagem.");
    }
  };
  return (
    <View style={styles.container}>
      <Pressable style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
        <Text style={styles.textoBotao}>Voltar</Text>
      </Pressable>

      <Text style={styles.title}>Upload de fotos</Text>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <Pressable onPress={EscolherImagem} style={styles.buttonGreen}>
        <Text style={styles.buttonTextWhite}>Selecionar imagem</Text>
      </Pressable>

    <Pressable onPress={() => uploadImage(imageUri)} style={styles.buttonWhite}>
        <Text style={styles.buttonTextGreen}>Enviar</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#285137",
    marginBottom: 20,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buttonGreen: {
    backgroundColor: "#285137",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonWhite: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#285137",
    marginVertical: 10,
  },
  buttonTextWhite: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonTextGreen: {
    color: "#285137",
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoVoltar: {
    backgroundColor: "#285137",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  textoBotao: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default UploadFoto;
