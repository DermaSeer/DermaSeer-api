-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(255) NOT NULL,
    "shop_name" VARCHAR(255) NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "product_rating" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "uid" TEXT NOT NULL,
    "name" VARCHAR(100),
    "email" TEXT NOT NULL,
    "age" INTEGER,
    "gender" VARCHAR(100),
    "profile_picture" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT,
    "image_url" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "publish_date" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_predicts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,
    "acne_type" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_predicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_results" (
    "id" TEXT NOT NULL,
    "predict_id" TEXT NOT NULL,
    "skin_type" VARCHAR(255) NOT NULL,
    "product_category" VARCHAR(255) NOT NULL,
    "ingredient" TEXT[],
    "msg_recommendation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "model_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "model_predicts_user_id_idx" ON "model_predicts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "model_results_predict_id_key" ON "model_results"("predict_id");

-- CreateIndex
CREATE INDEX "model_results_predict_id_idx" ON "model_results"("predict_id");

-- AddForeignKey
ALTER TABLE "model_predicts" ADD CONSTRAINT "model_predicts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_results" ADD CONSTRAINT "model_results_predict_id_fkey" FOREIGN KEY ("predict_id") REFERENCES "model_predicts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
