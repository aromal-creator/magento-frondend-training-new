<?php
namespace Codilar\Preference\Model;

class Product extends \Magento\Catalog\Model\Product
{
    /**
     * Same as Magento's getName(), plus a suffix.
     */
    public function getName()
    {
        return parent::getName() . ' - 2XL Exclusive';
    }
}
