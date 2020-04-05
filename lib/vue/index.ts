import { expressAppIn } from "../middleware/expressViewHelper";
import Git from "../wiki/gitmech";

const app = expressAppIn(__dirname);

app.get("/csrf-token.json", (req, res) => {
  res.set("Content-Type", "application/json").send({ token: req.csrfToken() });
});

app.get("/wikisubdirs.json", (req, res) => {
  Git.lsdirs((err: Error | null, gitdirs: string[]) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send(gitdirs);
  });
});

export default app;
