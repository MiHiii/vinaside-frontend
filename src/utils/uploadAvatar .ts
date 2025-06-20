export async function uploadAvatar(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append("files", file);

  const response = await fetch("http://localhost:8080/api/v1/upload/user", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Upload ảnh thất bại!");

  const data = await response.json();
  return data.data && data.data.urls && data.data.urls.length > 0
    ? data.data.urls[0]
    : "";
}
