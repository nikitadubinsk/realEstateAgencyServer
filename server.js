const express = require("express");
const PORT = 3001;
const history = require("connect-history-api-fallback");
const serveStatic = require("serve-static");
const fileUpload = require("express-fileupload");
const path = require("path");
const uniqueFilename = require("unique-filename");
const cors = require("cors");

const app = express();

// Парсинг json - application/json
app.use(
  fileUpload({
    createParentPath: true
  })
);

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// parse application/json
app.use(express.json());

app.use(cors({ origin: true, credentials: true }));

// Настройка CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Headers"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, PATCH, PUT, POST, DELETE, OPTIONS"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

const CONFIG = {
  DB: "std_704_realestateagency",
  USERNAME: "std_704_realestateagency",
  PASSWORD: "12345678",
  DIALECT: "mysql",
  HOST: "std-mysql.ist.mospolytech.ru"
};

const Sequelize = require("sequelize");
const sequelize = new Sequelize(CONFIG.DB, CONFIG.USERNAME, CONFIG.PASSWORD, {
  dialect: CONFIG.DIALECT,
  host: CONFIG.HOST
});

const Users = sequelize.define("Users", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: true
  },
  birthday: {
    type: Sequelize.STRING,
    allowNull: true
  },
  likes: {
    type: Sequelize.STRING,
    allowNull: true
  }
});

const Ads = sequelize.define("Ads", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: Sequelize.STRING,
    allowNull: true
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  address: {
    type: Sequelize.STRING,
    allowNull: true
  },
  size: {
    type: Sequelize.STRING,
    allowNull: true
  },
  floor: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  type_apartament: {
    type: Sequelize.STRING,
    allowNull: true
  },
  type_ad: {
    type: Sequelize.STRING,
    allowNull: true
  },
  relevance: {
    type: Sequelize.BOOLEAN,
    allowNull: true
  },
  realtor_id: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  conveniences: {
    type: Sequelize.STRING,
    allowNull: true
  },
  photo: {
    type: Sequelize.STRING,
    allowNull: true
  },
  latitude: {
    type: Sequelize.STRING,
    allowNull: true
  },
  longitude: {
    type: Sequelize.STRING,
    allowNull: true
  },
  price: {
    type: Sequelize.STRING,
    allowNull: true
  },
  developer_id: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
});

const Developers = sequelize.define("Developers", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: true
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: true
  }
});

const Realtors = sequelize.define("Realtors", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: true
  },
  birthday: {
    type: Sequelize.STRING,
    allowNull: true
  },
  telephone: {
    type: Sequelize.STRING,
    allowNull: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: true
  },
  developer_id: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
});

Ads.belongsTo(Realtors, {
  foreignKey: "realtor_id",
  as: "realtor",
  onDelete: "CASCADE"
});
Realtors.hasOne(Ads, {
  foreignKey: "realtor_id",
  as: "realtor",
  onDelete: "CASCADE"
});

Realtors.belongsTo(Developers, {
  foreignKey: "developer_id",
  as: "developerRealtor",
  onDelete: "CASCADE"
});
Developers.hasOne(Realtors, {
  foreignKey: "developer_id",
  as: "developerRealtor",
  onDelete: "CASCADE"
});

Ads.belongsTo(Developers, {
  foreignKey: "developer_id",
  as: "developer",
  onDelete: "CASCADE"
});
Developers.hasOne(Ads, {
  foreignKey: "developer_id",
  as: "developer",
  onDelete: "CASCADE"
});

const Op = Sequelize.Op;

// Дальше идут запросы

// ЗАПРОСЫ ДЛЯ ЗАСТРОЙЩИКОВ
app.post("/api/developer/auth", async (req, res) => {
  try {
    let result = await Developers.count({
      where: { email: req.body.email, password: req.body.password }
    });
    if (result === 0) {
      result = await Developers.count({
        where: { email: req.body.email }
      });
      if (result == 0) {
        res.status(500).send({
          message: "Данный пользователь не найден"
        });
      } else {
        res.status(500).send({
          message: "Неверный пароль"
        });
      }
    } else {
      result = await Developers.findOne({
        where: { email: req.body.email, password: req.body.password }
      });
      res.send(result);
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка во время авторизации (${e.message})`
    });
  }
});

app.post("/api/developer/regisrtation", async (req, res) => {
  try {
    let count = await Developers.count({
      where: { email: req.body.email }
    });
    if (count == 0) {
      let result = await Developers.create({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        description: req.body.description
      });
      res.send(result);
    } else {
      res.status(500).send({
        message: "Данный застройщик уже зарегестрирован"
      });
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка во время регистрации застройщика ${e.message}`
    });
  }
});

app.post("/api/developer/new-realtor", async (req, res) => {
  try {
    let count = await Realtors.count({
      where: { email: req.body.email }
    });
    if (count == 0) {
      let result = await Realtors.create({
        email: req.body.email,
        name: req.body.name,
        telephone: req.body.telephone,
        birthday: req.body.birthday,
        developer_id: req.body.developer_id
      });
      res.send(result);
    } else {
      res.status(500).send({
        message: "Данный риэлтор уже зарегестрирован"
      });
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка во время добавлении нового риэлтора ${e.message}`
    });
  }
});

app.get("/api/developer/statistics/:developer_id", async (req, res) => {
  try {
    let result1 = await Ads.count({
      where: { relevance: true, developer_id: req.params.developer_id }
    });
    let result2 = await Ads.count({
      where: { relevance: false, developer_id: req.params.developer_id }
    });
    res.send({ relevance: result1, achive: result2 });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: "Произошла небольшая ошибка при получении статистики"
    });
  }
});

app.get("/api/developer/ads/:developer_id", async (req, res) => {
  try {
    let result = await Ads.findAll({
      where: {
        developer_id: req.params.developer_id
      },
      include: [
        { model: Realtors, as: "realtor" },
        { model: Developers, as: "developer" }
      ]
    });
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message:
        "Произошла небольшая ошибка при получении списка всех объявлений застройщика"
    });
  }
});

app.delete("/api/developer/deleteRealtor/:id", async (req, res) => {
  try {
    let result = await Realtors.destroy({
      where: { id: req.params.id }
    });
    res.send(result.status);
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка во время удаления всех вопросов ${e.message}`
    });
  }
});

app.put("/api/developer/edit", async (req, res) => {
  try {
    let result = await Realtors.update(
      {
        name: req.body.name,
        email: req.body.email,
        telephone: req.body.telephone
      },
      {
        where: {
          id: req.body.id
        }
      }
    );
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка во время редактирования риэлтора ${e.message}`
    });
  }
});

// -------------------------------------------------------- //

// ЗАПРОСЫ ДЛЯ РИЭЛТОРОВ

app.put("/api/realtor/archive", async (req, res) => {
  try {
    let result = await Ads.update(
      {
        relevance: req.body.relevance
      },
      {
        where: {
          id: req.body.id
        }
      }
    );
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка во время архивирования объявления ${e.message}`
    });
  }
});

// ЗАПРОСЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ

app.post("/api/user/auth", async (req, res) => {
  try {
    let result = await Users.count({
      where: { email: req.body.email, password: req.body.password }
    });
    if (result === 0) {
      result = await Users.count({
        where: { email: req.body.email }
      });
      if (result == 0) {
        res.status(500).send({
          message: "Данный пользователь не найден"
        });
      } else {
        res.status(500).send({
          message: "Неверный пароль"
        });
      }
    } else {
      result = await Users.findOne({
        where: { email: req.body.email, password: req.body.password }
      });
      res.send(result);
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка во время авторизации (${e.message})`
    });
  }
});

app.put("/api/user/likeAd", async (req, res) => {
  try {
    let result = await Users.update(
      {
        likes: req.body.likes
      },
      {
        where: {
          id: req.body.id
        }
      }
    );
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка во время постановки лайка ${e.message}`
    });
  }
});

app.get("/api/user/:user_id", async (req, res) => {
  try {
    let result = await Users.findOne({
      where: {
        id: req.params.user_id
      }
    });
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка при получении списка всех понравившихся объявлений ${e.message}`
    });
  }
});

app.get("/api/user/ads/:user_id", async (req, res) => {
  try {
    let res1 = await Users.findOne({
      where: {
        id: req.params.user_id
      }
    });
    let result;
    if (res1.dataValues.likes) {
      result = await Ads.findAll({
        where: {
          id: {
            [Op.in]: res1.dataValues.likes.split(",")
          }
        },
        include: [
          { model: Realtors, as: "realtor" },
          { model: Developers, as: "developer" }
        ]
      });
    } else {
      result = [];
    }
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка при получении списка всех понравившихся объявлений ${e.message}`
    });
  }
});

app.post("/api/user/ads", async (req, res) => {
  try {
    let result = await Ads.findAll({
      where: {
        type_ad: { [Op.in]: req.body.type_ad },
        type_apartament: { [Op.in]: req.body.type_apartament },
        size: { [Op.gte]: req.body.size },
        price: { [Op.between]: [req.body.priceFrom, req.body.priceTo] },
        relevance: true
      },
      include: [
        { model: Realtors, as: "realtor" },
        { model: Developers, as: "developer" }
      ]
    });
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка при получении списка всех объявлений ${e.message}`
    });
  }
});

app.put("/api/user/changelikes", async (req, res) => {
  try {
    let result = await Users.update(
      {
        likes: req.body.likes
      },
      {
        where: {
          id: req.body.id
        }
      }
    );
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка во время лайканья ${e.message}`
    });
  }
});

app.post("/api/realtor/auth", async (req, res) => {
  try {
    let result = await Realtors.count({
      where: { email: req.body.email, password: req.body.password }
    });
    if (result === 0) {
      result = await Realtors.count({
        where: { email: req.body.email }
      });
      if (result == 0) {
        res.status(500).send({
          message: "Данный пользователь не найден"
        });
      } else {
        res.status(500).send({
          message: "Неверный пароль"
        });
      }
    } else {
      result = await Realtors.findOne({
        where: { email: req.body.email, password: req.body.password }
      });
      res.send(result);
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка во время авторизации (${e.message})`
    });
  }
});

app.post("/api/user/registration", async (req, res) => {
  try {
    let count = await Users.count({
      where: { email: req.body.email }
    });
    if (count == 0) {
      let result = await Users.create({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        birthday: req.body.birthday
      });
      res.send(result);
    } else {
      res.status(500).send({
        message: "Данный пользователь уже зарегестрирован"
      });
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка во время регистрации пользователя ${e.message}`
    });
  }
});

app.post("/api/developer/realtors", async (req, res) => {
  try {
    let result = await Realtors.findAll({
      where: { developer_id: req.body.developer_id }
    });
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка при получении списка всех риэлторов ${e.message}`
    });
  }
});

// Получение файла и загрузка его в папку uploads
app.post("/api/upload-photo/", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "Нет файла для загрузки"
      });
    } else {
      let photo = req.files.file0;
      let name = uniqueFilename("") + "." + photo.name.split(".")[1];
      photo.mv("uploads/" + name);
      res.send({
        status: true,
        message: "Файл успешно загружен",
        filename: name
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Произошла небольшая ошибка во время загрузки картинки (${e.message})`
    });
  }
});

//Получение полного пути файла
app.get("/api/photo/:filename", (req, res) => {
  res.sendFile(path.join(__dirname, "uploads", req.params.filename));
});

app.post("/api/realtor/find", async (req, res) => {
  try {
    let result = await Realtors.count({
      where: { email: req.body.email }
    });
    if (result == 0) {
      res.status(500).send({
        message: "Данный пользователь не найден"
      });
    } else {
      result = await Realtors.findOne({
        where: { email: req.body.email }
      });
      if (result.password) {
        res.status(500).send({
          message: "Для данного пользователя пароль уже задан"
        });
      } else {
        res.send(result);
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка во время авторизации (${e.message})`
    });
  }
});

app.put("/api/realtor/newPassword", async (req, res) => {
  try {
    let result = await Realtors.update(
      {
        password: req.body.password
      },
      {
        where: {
          id: req.body.id
        }
      }
    );
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: `Произошла небольшая ошибка во время добавлении пароля ${e.message}`
    });
  }
});

app.post("/api/realtor/newAd", async (req, res) => {
  try {
    let realtor = await Realtors.findOne({
      where: {
        id: req.body.realtor_id
      }
    });
    let result = await Ads.create({
      title: req.body.title,
      description: req.body.description,
      address: req.body.address,
      size: req.body.size,
      floor: req.body.floor,
      type_apartament: req.body.type_apartament,
      type_ad: req.body.type_ad,
      conveniences: req.body.conveniences,
      price: req.body.price,
      photo: req.body.photo,
      developer_id: realtor.developer_id,
      realtor_id: req.body.realtor_id,
      relevance: true,
      latitude: req.body.latitude,
      longitude: req.body.longitude
    });
    res.send(result);
  } catch (e) {
    res.status(500).send({
      message: `Произошла небольшая ошибка во время добавлении нового риэлтора ${e.message}`
    });
  }
});

app.get("/api/ads", async (req, res) => {
  try {
    let result = await Ads.findAll({
      include: [
        { model: Realtors, as: "realtor" },
        { model: Developers, as: "developer" }
      ]
    });
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message:
        "Произошла небольшая ошибка при получении списка всех администраторов"
    });
  }
});

app.get("/api/realtor/ads/:id", async (req, res) => {
  try {
    let result = await Ads.findAll({
      where: {
        realtor_id: req.params.id
      },
      include: [
        { model: Realtors, as: "realtor" },
        { model: Developers, as: "developer" }
      ]
    });
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message:
        "Произошла небольшая ошибка при получении списка всех объявлений риэлтора"
    });
  }
});

app.use(history());

sequelize
  //.sync({ force: true })
  .sync()
  .then(async () => {
    app.listen(PORT, () => {
      console.log(`Сервер запущен по адресу http://localhost:${PORT}`);
    });
    console.log("Вы успешно подключились к базе данных");
  })
  .catch(err => console.log(err));
