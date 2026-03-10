/*
  Warnings:

  - Added the required column `sport` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'SCHEDULED', 'LIVE', 'HALFTIME', 'FINISHED', 'POSTPONED', 'CANCELLED', 'IN_REVIEW');

-- CreateEnum
CREATE TYPE "SportType" AS ENUM ('FOOTBALL', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL');

-- CreateEnum
CREATE TYPE "MatchPeriod" AS ENUM ('FIRST_HALF', 'SECOND_HALF', 'EXTRA_TIME', 'PENALTIES');

-- CreateEnum
CREATE TYPE "CommentaryType" AS ENUM ('GOAL', 'FOUL', 'SUBSTITUTION', 'GENERAL');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "sport" "SportType" NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
ALTER COLUMN "homeTeamScore" SET DEFAULT 0,
ALTER COLUMN "awayTeamScore" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "Commentary" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL,
    "period" "MatchPeriod" NOT NULL,
    "eventType" "CommentaryType" NOT NULL,
    "actor" TEXT,
    "team" TEXT,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commentary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Commentary" ADD CONSTRAINT "Commentary_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
