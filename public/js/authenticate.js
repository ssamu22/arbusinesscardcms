export const register = async ({ ...userInput }) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/arcms/api/v1/employees/signup",
      userInput
    );
    console.log("THE RESPONSE DATA:", response.data);

    console.log("RELOCATING...");
    window.location.assign("/success");
  } catch (err) {
    console.log(err.response.data.message);
    alert(err.response.data.message);
  }
};
