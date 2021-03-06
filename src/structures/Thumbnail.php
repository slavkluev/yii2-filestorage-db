<?php

namespace ozerich\filestorage\structures;

class Thumbnail
{
    /** @var int */
    private $width;

    /** @var int */
    private $height;

    /** @var bool */
    private $crop;

    /** @var bool */
    private $exact;

    /**
     * Thumbnail constructor.
     * @param int $width
     * @param int $height
     * @param bool $crop
     * @param bool $exact
     */
    public function __construct($width = 0, $height = 0, $crop = false, $exact = false)
    {
        $this->width = $width;
        $this->height = $height;
        $this->crop = $crop;
        $this->exact = $exact;
    }

    /**
     * @return int
     */
    public function getWidth()
    {
        return $this->width;
    }

    /**
     * @return int
     */
    public function getHeight()
    {
        return $this->height;
    }

    /**
     * @return bool
     */
    public function getCrop()
    {
        return $this->crop;
    }

    /**
     * @return bool
     */
    public function getExact()
    {
        return $this->exact;
    }

    /**
     * @return string
     */
    public function getFilenamePrefix()
    {
        return ($this->width ? $this->width : 'AUTO') . '_' . ($this->height ? $this->height : 'AUTO');
    }

    /**
     * @return string
     */
    public function getThumbId()
    {
        return ($this->width ? $this->width : 'AUTO') . 'x' . ($this->height ? $this->height : 'AUTO');
    }


}