import "reflect-metadata";
import { AppDataSource } from "./db/data-source";
import { createApp } from "./app";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    const app = createApp(AppDataSource);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.error("❌ Data Source initialization error:", error));
