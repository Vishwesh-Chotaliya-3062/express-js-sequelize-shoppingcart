DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteOrder`(IN `_orderId` INT(11))
BEGIN
	
	DELETE FROM `order` WHERE `order`.`id` = _orderId;
   
END$$
DELIMITER ;