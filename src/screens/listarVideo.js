// Flávia Glenda N°04 e Lucas Randal N°18
import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Text, ActivityIndicator, Pressable,} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Video } from "expo-av";
import { supabase } from "../../supabaseConfig";

const bucketName = "profile-photos";

export default function ListarVideos({ navigation }) {
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase.storage.from(bucketName).list("", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

      if (error) {
        console.error("Erro ao buscar categorias", error);
        throw error;
      }

      console.log("Dados das categorias: ", data);

      const categoriesList = data.map((file) => file.name);
      setCategories(categoriesList);
      console.log("Categorias extraídas:", categoriesList);

      if (categoriesList.length > 0) {
        setCategory(categoriesList[0]);
      }
    } catch (error) {
      console.log("Erro ao carregar categorias: ", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fecthVideos = async () => {
    if (!category) return;

    setLoading(true);
    const prefix = `${category}/`;

    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(prefix, {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) {
        console.error("Erro ao buscar videos: ", error);
        throw error;
      }

      console.log("Dados dos vídeos:", data);

      const videoFiles = data?.filter((file) => file.name.endsWith(".mp4"));

      if (videoFiles?.lenght > 0) {
        const videoUrls = videoFiles.map((file) => {
          const fullPath = `${prefix}${file.name}`;
          const { data } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fullPath);
          const publicUrl = data?.publicUrl || "";
          console.log("URL pública gerada: ", publicUrl);
          return {
            key: file.name,
            name: file.name,
            url: publicUrl,
          };
        });

        setVideos(videoUrls);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.log("Erro ao carregar vídeos ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (category) {
      fetchVideos();
    }
  }, [category]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Galeria de Vídeos</Text>

      <Text style={styles.subtitle}>Selecione uma categoria</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          {categories.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#32CD32" />
      ) : (
        <View style={styles.gallery}>
          {videos.map((video, index) => (
            <View key={index} style={styles.videoContainer}>
              <Text style={styles.videoTitle}>{video.name}</Text>
              <Video
                source={{ uri: video.url }}
                useNativeControls
                resizeMode="contain"
                shouldPlay={false}
                style={styles.video}
              />
            </View>
          ))}
        </View>
      )}

      <Pressable style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
        <Text style={styles.textoBotao}>Voltar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#f4f4f4",
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
  subtitle: {
    fontSize: 18,
    color: "#285137",
    marginBottom: 10,
  },
  pickerContainer: {
    width: "100%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#285137",
    borderRadius: 8,
    overflow: "hidden",
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  videoContainer: {
    width: "100%",
    marginBottom: 16,
    padding: 4,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#285137",
    marginBottom: 8,
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
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
