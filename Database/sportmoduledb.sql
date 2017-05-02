CREATE DATABASE  IF NOT EXISTS `sportmoduledb` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `sportmoduledb`;
-- MySQL dump 10.13  Distrib 5.7.9, for Win64 (x86_64)
--
-- Host: localhost    Database: sportmoduledb
-- ------------------------------------------------------
-- Server version	5.7.11-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `geodata`
--

DROP TABLE IF EXISTS `geodata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `geodata` (
  `geoId` varchar(40) NOT NULL,
  `routeId` varchar(40) NOT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `latitudeDirection` char(1) NOT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `longitudeDirection` char(1) NOT NULL,
  `altitude` decimal(10,7) DEFAULT NULL,
  `time` datetime NOT NULL,
  PRIMARY KEY (`geoId`,`routeId`),
  UNIQUE KEY `geoId_UNIQUE` (`geoId`,`routeId`),
  KEY `routeFK_idx` (`routeId`),
  CONSTRAINT `routeFK` FOREIGN KEY (`routeId`) REFERENCES `route` (`routeId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `route`
--

DROP TABLE IF EXISTS `route`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `route` (
  `routeId` varchar(40) NOT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime DEFAULT NULL,
  PRIMARY KEY (`routeId`),
  UNIQUE KEY `routeId_UNIQUE` (`routeId`),
  UNIQUE KEY `startDate_UNIQUE` (`startDate`),
  UNIQUE KEY `endDate_UNIQUE` (`endDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tphdata`
--

DROP TABLE IF EXISTS `tphdata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tphdata` (
  `tphId` varchar(40) NOT NULL,
  `routeId` varchar(40) NOT NULL,
  `temperature` decimal(4,2) NOT NULL,
  `pressure` decimal(6,2) NOT NULL,
  `humidity` decimal(4,2) NOT NULL,
  PRIMARY KEY (`tphId`),
  UNIQUE KEY `tphId_UNIQUE` (`tphId`),
  KEY `routeFK_idx` (`routeId`),
  CONSTRAINT `routeId` FOREIGN KEY (`routeId`) REFERENCES `route` (`routeId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-05-02 16:12:15
