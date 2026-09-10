<?php if (!is_front_page()) : ?>
   <?php if (function_exists('bcn_display')) : ?>
      <div class="l-breadcrumb">
         <div id="breadcrumb" class="w_inner p-breadcrumb " vocab="http://schema.org/" typeof="BreadcrumbList">
            <div class="p-breadcrumb__inner l-inner">
               <?php bcn_display(); ?>
            </div>
            <!-- /.p-breadcrumb__inner -->
         </div>
         <!-- /.p-breadcrumb -->
      </div>
      <!-- /.l-breadcrumb -->
   <?php endif; ?>
<?php endif ?>
