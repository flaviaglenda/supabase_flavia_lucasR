// Flávia Glenda N°04 e Lucas Randal N°18
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Modal, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import s3 from "../../supabaseConfig";
import * as Notifications from "expo-notifications";

const S3_BUCKET = "profile-photo";

export default function UploadVideo({ navigation }) {
    const [video, setVideo] = useState(null);
    const [category, setCategory] = useState("");
    const [uploading, setUploading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const subscription = Notifications.addNotificationReceivedListener(notification => {
            console.log("Notificação recebida:", notification);
        });
        return () => subscription.remove();
    }, []);

    const requestLocalNotificationsPermission = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permissão negada",
                "Ative as notificações para ver os avisos"
            );
            return false;
        }
        return true;
    };

    const pickVideo = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["video/*"],
                copyToCacheDirectory: true,
            });
            const asset = result.assets && result.assets.length > 0 ? result.assets[0] : result;
            if (asset && asset.uri) {
                setVideo({
                    uri: asset.uri,
                    name: asset.name,
                    type: asset.mimeType || "video/mp4",
                });
                setModalVisible(true);
            } else {
                Alert.alert("Erro", "Nenhum vídeo selecionado.");
            }
        } catch (error) {
            console.error("Erro ao selecionar vídeo: ", error);
            Alert.alert("Erro", "Não foi possível selecionar o vídeo.");
        }
    };

    const uploadVideo = async () => {
        if (!video) {
            Alert.alert("Erro", "Por favor, selecione um vídeo.");
            return;
        }
        if (!category.trim()) {
            Alert.alert("Erro", "Por favor, insira um nome de categoria.");
            return;
        }

        try {
            setUploading(true);
            console.log("Iniciando upload do vídeo...", video);
            const response = await fetch(video.uri);
            const blob = await response.blob();
            const filePath = `videos/${category}/${Date.now()}_${video.name}`;
            const uploadParams = {
                Bucket: S3_BUCKET,
                Key: filePath,
                Body: blob,
                ContentType: video.type,
            };

            s3.upload(uploadParams, async (err, data) => {
                setUploading(false);
                if (err) {
                    console.error("Erro no upload: ", err);
                    Alert.alert("Erro", "Falha no envio do vídeo.");
                } else {
                    console.log("Vídeo enviado! URL: ", data.Location);
                    Alert.alert("Sucesso", "Vídeo enviado com sucesso!");
                    setVideo(null);
                    setCategory("");
                    setModalVisible(false);

                    const permissao = await requestLocalNotificationsPermission();
                    if (permissao) {
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: "Upload do vídeo realizado com sucesso",
                                body: `${video.name} foi adicionado.`,
                                sound: true,
                            },
                            trigger: null,
                        });
                    }
                }
            });
        } catch (error) {
            console.error("Erro no upload: ", error);
            Alert.alert("Erro", "Falha no envio do vídeo.");
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Carregar Vídeo</Text>
            <Pressable style={styles.button} onPress={pickVideo}>
                <Text style={styles.buttonText}>Selecionar Vídeo</Text>
            </Pressable>

            {video && (
                <View style={styles.selectedVideoContainer}>
                    <Text style={styles.selectedVideoTitle}>Vídeo Selecionado:</Text>
                    <Text style={styles.selectedVideoName}>{video.name}</Text>
                </View>
            )}

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Selecione uma Categoria</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nome da categoria"
                            value={category}
                            onChangeText={setCategory}
                        />
                        <Pressable style={styles.submitButton} onPress={uploadVideo}>
                            <Text style={styles.submitButtonText}>
                                {uploading ? "Enviando..." : "Enviar Vídeo"}
                            </Text>
                        </Pressable>
                        <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Fechar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>Voltar</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#f4f4f4",
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#285137',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: "#285137",
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginBottom: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    selectedVideoContainer: {
        marginBottom: 20,
    },
    selectedVideoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#285137',
    },
    selectedVideoName: {
        fontSize: 16,
        color: '#285137',
        marginTop: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 8,
        width: "80%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    input: {
        width: "100%",
        height: 40,
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    submitButton: {
        backgroundColor: "white",
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
    },
    submitButtonText: {
        color: "#285137",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    closeButton: {
        marginTop: 10,
    },
    closeButtonText: {
        color: "#285137",
        fontSize: 16,
    },
    backButton: {
        backgroundColor: "#285137",
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginTop: 20,
    },
    backButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
});
