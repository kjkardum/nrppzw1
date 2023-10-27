/*
  Warnings:

  - Added the required column `drawPoints` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `losePoints` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winPoints` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Made the column `competitionId` on table `Player` required. This step will fail if there are existing NULL values in that column.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Player] DROP CONSTRAINT [Player_competitionId_fkey];

-- AlterTable
ALTER TABLE [dbo].[Competition] ADD [drawPoints] INT NOT NULL,
[losePoints] INT NOT NULL,
[ownerId] NVARCHAR(1000) NOT NULL,
[winPoints] INT NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Player] ALTER COLUMN [competitionId] INT NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[Round] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [competitionId] INT NOT NULL,
    [order] INT NOT NULL,
    [completed] BIT NOT NULL CONSTRAINT [Round_completed_df] DEFAULT 0,
    CONSTRAINT [Round_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Match] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [roundId] INT NOT NULL,
    [firstPlayerId] INT NOT NULL,
    [secondPlayerId] INT NOT NULL,
    [resultEnum] INT NOT NULL,
    CONSTRAINT [Match_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Player] ADD CONSTRAINT [Player_competitionId_fkey] FOREIGN KEY ([competitionId]) REFERENCES [dbo].[Competition]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Round] ADD CONSTRAINT [Round_competitionId_fkey] FOREIGN KEY ([competitionId]) REFERENCES [dbo].[Competition]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Match] ADD CONSTRAINT [Match_roundId_fkey] FOREIGN KEY ([roundId]) REFERENCES [dbo].[Round]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Match] ADD CONSTRAINT [Match_firstPlayerId_fkey] FOREIGN KEY ([firstPlayerId]) REFERENCES [dbo].[Player]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Match] ADD CONSTRAINT [Match_secondPlayerId_fkey] FOREIGN KEY ([secondPlayerId]) REFERENCES [dbo].[Player]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
