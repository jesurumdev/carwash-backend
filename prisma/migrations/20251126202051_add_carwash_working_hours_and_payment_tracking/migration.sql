-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paymentReference" TEXT,
ADD COLUMN     "paymentStatus" TEXT;

-- AlterTable
ALTER TABLE "CarWash" ADD COLUMN     "breakEndTime" TEXT,
ADD COLUMN     "breakStartTime" TEXT,
ADD COLUMN     "closingTime" TEXT NOT NULL DEFAULT '18:00',
ADD COLUMN     "openingTime" TEXT NOT NULL DEFAULT '09:00',
ADD COLUMN     "slotDurationMinutes" INTEGER NOT NULL DEFAULT 30;
