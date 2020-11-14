import { expressAppIn } from "../middleware/expressViewHelper";
import Git from "../wiki/gitmech";
import { reply } from "../commons/replies";

const app = expressAppIn(__dirname);

app.get("/csrf-token.json", (req, res) => {
  res.set("Content-Type", "application/json").send({ token: req.csrfToken() });
});

app.get("/wikisubdirs.json", (req, res) => {
  Git.lsdirs((err: Error | null, gitdirs: string[]) => {
    reply(res, err, { dirs: gitdirs });
  });
});

export default app;
