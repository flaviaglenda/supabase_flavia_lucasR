// Flávia Glenda N°04 e Lucas Randal N°18
import React, { useState } from "react";
import { Pressable, Image, View, Text, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import s3 from "../../supabaseConfig";

const S3_BUCKET = "profile-photo";

const UploadFoto = ({ navigation }) => {
    const [imageUri, setImageUri] = useState(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permissão necessária", "Precisamos da sua permissão para acessar suas fotos.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const uploadImage = async () => {
        if (!imageUri) {
            Alert.alert("Erro", "Nenhuma imagem selecionada");
            return;
        }

        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const filename = `imagens/${Date.now()}.jpg`;

            const params = {
                Bucket: S3_BUCKET,
                Key: filename,
                Body: blob,
                ContentType: "image/jpeg",
            };

            s3.upload(params, (err, data) => {
                if (err) {
                    console.error("Erro no upload", err);
                    Alert.alert("Erro", "Falha no envio da imagem");
                } else {
                    console.log("Imagem disponível em:", data.Location);
                    Alert.alert("Sucesso", "Imagem salva com sucesso!");
                    setImageUri(null);
                }
            });
        } catch (error) {
            console.error("Erro no upload:", error);
            Alert.alert("Erro", "Falha no envio da imagem");
        }
    };

    return (
        <View style={styles.container}>
            <Pressable style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
                <Text style={styles.textoBotao}>Voltar</Text>
            </Pressable>

            <Text style={styles.title}>Upload de fotos</Text>

            {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

            <Pressable onPress={pickImage} style={styles.buttonGreen}>
                <Text style={styles.buttonTextWhite}>Selecionar imagem</Text>
            </Pressable>

            <Pressable onPress={uploadImage} style={styles.buttonWhite}>
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
        fontWeight: 'bold',
        color: '#285137',
        marginBottom: 20,
        textAlign: 'center',
        textTransform: 'uppercase',
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
        backgroundColor: '#285137',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 20,
    },
    textoBotao: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default UploadFoto;