-- CreateTable
CREATE TABLE "ConversationState" (
    "id" SERIAL NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "carWashId" INTEGER,
    "serviceId" INTEGER,
    "date" TIMESTAMP(3),
    "timeSlot" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConversationState_customerPhone_key" ON "ConversationState"("customerPhone");
